package fr.heypapi.shield

import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.telecom.Call
import android.telecom.CallScreeningService
import kotlin.concurrent.thread

/** Android appelle ce service à chaque appel entrant. On laisse TOUJOURS l'appel sonner : on affiche seulement un bandeau d'information. */
class CallScreener : CallScreeningService() {
    override fun onScreenCall(details: Call.Details) {
        val allow = CallResponse.Builder().build()
        if (details.callDirection != Call.Details.DIRECTION_INCOMING) { respondToCall(details, allow); return }
        val number = details.handle?.schemeSpecificPart?.takeIf { it.isNotBlank() }
        val main = Handler(Looper.getMainLooper())
        thread {
            val verdict = try { if (number == null) null else Api.check(applicationContext, number) } catch (_: Exception) { null }
            main.post {
                try { if (Settings.canDrawOverlays(applicationContext)) Overlay.show(applicationContext, number, verdict) } catch (_: Exception) {}
                respondToCall(details, allow)
            }
        }
    }
}
