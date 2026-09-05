import Capacitor
import Foundation
import StoreKit

// App Store経由のサブスク購入(StoreKit2)をWeb側(www/index.html)から呼び出すためのブリッジ。
// App Store Connect側で作成する商品IDは www/index.html の PRODUCT_ID と一致させること。
@objc(SubscriptionPlugin)
public class SubscriptionPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SubscriptionPlugin"
    public let jsName = "Subscription"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getEntitlement", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restorePurchases", returnType: CAPPluginReturnPromise),
    ]

    @objc func getEntitlement(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("productId is required")
            return
        }
        Task {
            let active = await Self.hasActiveEntitlement(productId: productId)
            call.resolve(["active": active])
        }
    }

    @objc func purchase(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("productId is required")
            return
        }
        Task {
            do {
                let products = try await Product.products(for: [productId])
                guard let product = products.first else {
                    call.reject("Product not found: \(productId)")
                    return
                }
                let result = try await product.purchase()
                switch result {
                case .success(let verification):
                    if case .verified(let transaction) = verification {
                        await transaction.finish()
                        call.resolve(["active": true])
                    } else {
                        call.reject("Purchase could not be verified")
                    }
                case .userCancelled:
                    call.resolve(["active": false, "cancelled": true])
                case .pending:
                    call.resolve(["active": false, "pending": true])
                @unknown default:
                    call.resolve(["active": false])
                }
            } catch {
                call.reject("Purchase failed: \(error.localizedDescription)")
            }
        }
    }

    @objc func restorePurchases(_ call: CAPPluginCall) {
        let productId = call.getString("productId")
        Task {
            // AppStore.sync()は実App Storeとの同期が必要なため、
            // ローカルのStoreKit Testing環境ではネットワーク要因で失敗しうる。
            // 失敗してもcurrentEntitlementsで既存の購入状態は確認できるので、
            // ここではエラーを致命的として扱わない。
            do {
                try await AppStore.sync()
            } catch {
                CAPLog.print("AppStore.sync() failed, checking local entitlements anyway: \(error.localizedDescription)")
            }
            let active = await Self.hasActiveEntitlement(productId: productId)
            call.resolve(["active": active])
        }
    }

    private static func hasActiveEntitlement(productId: String?) async -> Bool {
        for await result in Transaction.currentEntitlements {
            guard case .verified(let transaction) = result else { continue }
            if let productId, transaction.productID != productId { continue }
            if transaction.revocationDate == nil {
                return true
            }
        }
        return false
    }

    // 本番Webアプリ(er-assist-app.vercel.app)の共通Basic認証に自動応答する。
    // Capacitorはデフォルトでは認証チャレンジを拒否する(.rejectProtectionSpace)ため、
    // ここで明示的に処理しないと「認証が必要です。」の本文がそのまま表示されてしまう。
    //
    // 実際のユーザー名/パスワードはコードに直書きせず、ios/Secrets.xcconfig
    // (.gitignore対象、Info.plist経由でここに渡される)に置く。
    // Vercelの環境変数 APP_ACCESS_USERNAME / APP_ACCESS_PASSWORD_HASH と対応する値にすること。
    private static let basicAuthHost = "er-assist-app.vercel.app"

    private static var basicAuthUsername: String? {
        Bundle.main.object(forInfoDictionaryKey: "APP_BASIC_AUTH_USERNAME") as? String
    }

    private static var basicAuthPassword: String? {
        Bundle.main.object(forInfoDictionaryKey: "APP_BASIC_AUTH_PASSWORD") as? String
    }

    override public func handleWKWebViewURLAuthenticationChallenge(
        _ challenge: URLAuthenticationChallenge,
        completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void
    ) -> Bool {
        guard challenge.protectionSpace.host == Self.basicAuthHost,
              challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodHTTPBasic,
              let username = Self.basicAuthUsername, !username.isEmpty,
              let password = Self.basicAuthPassword, !password.isEmpty else {
            return false
        }
        let credential = URLCredential(user: username, password: password, persistence: .forSession)
        completionHandler(.useCredential, credential)
        return true
    }
}
