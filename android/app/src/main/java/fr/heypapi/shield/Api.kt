package fr.heypapi.shield

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/** Résultat d'une vérification : niveau = "aucun" | "attention" | "danger". */
data class Verdict(val niveau: String, val n: Int, val dernier: String?, val motifs: List<String>)

/** Appels réseau vers Supabase (connexion + fonction check_client_call). Aucune bibliothèque externe. */
object Api {
    private val base get() = BuildConfig.SUPABASE_URL.trimEnd('/')
    private val key get() = BuildConfig.SUPABASE_KEY
    private fun prefs(c: Context) = c.applicationContext.getSharedPreferences("shield", Context.MODE_PRIVATE)

    private fun call(method: String, url: String, body: String?, token: String?, timeoutMs: Int): Pair<Int, String> {
        val c = URL(url).openConnection() as HttpURLConnection
        try {
            c.requestMethod = method; c.connectTimeout = timeoutMs; c.readTimeout = timeoutMs
            c.setRequestProperty("apikey", key); c.setRequestProperty("Content-Type", "application/json")
            if (token != null) c.setRequestProperty("Authorization", "Bearer $token")
            if (body != null) { c.doOutput = true; c.outputStream.use { it.write(body.toByteArray()) } }
            val code = c.responseCode
            val text = (if (code in 200..299) c.inputStream else c.errorStream)?.bufferedReader()?.use { it.readText() } ?: ""
            return code to text
        } finally { c.disconnect() }
    }

    private fun saveSession(ctx: Context, j: JSONObject) {
        prefs(ctx).edit()
            .putString("access", j.getString("access_token")).putString("refresh", j.getString("refresh_token"))
            .putLong("exp", System.currentTimeMillis() + (j.optLong("expires_in", 3600) - 60) * 1000).apply()
    }

    /** Retourne null si OK, sinon un message d'erreur lisible. */
    fun login(ctx: Context, email: String, password: String): String? = try {
        val (code, text) = call("POST", "$base/auth/v1/token?grant_type=password", JSONObject().put("email", email).put("password", password).toString(), null, 10000)
        if (code == 200) { saveSession(ctx, JSONObject(text)); null } else "Connexion refusée : e-mail ou mot de passe incorrect."
    } catch (e: Exception) { "Réseau indisponible." }

    fun logout(ctx: Context) { prefs(ctx).edit().clear().apply() }
    fun loggedIn(ctx: Context) = prefs(ctx).getString("refresh", null) != null

    private fun token(ctx: Context): String? {
        val p = prefs(ctx); val acc = p.getString("access", null); val ref = p.getString("refresh", null) ?: return null
        if (acc != null && System.currentTimeMillis() < p.getLong("exp", 0)) return acc
        val (code, text) = call("POST", "$base/auth/v1/token?grant_type=refresh_token", JSONObject().put("refresh_token", ref).toString(), null, 3000)
        if (code != 200) return null
        val j = JSONObject(text); saveSession(ctx, j); return j.getString("access_token")
    }

    /** Vérifie un numéro. Renvoie null si la vérification est impossible (hors ligne, non connecté, limite atteinte…). */
    fun check(ctx: Context, number: String): Verdict? {
        val t = token(ctx) ?: return null
        val (code, text) = call("POST", "$base/rest/v1/rpc/check_client_call", JSONObject().put("p_phone", number).toString(), t, 3000)
        if (code != 200) return null
        val a = JSONArray(text); if (a.length() == 0) return null
        val o = a.getJSONObject(0); val cats = o.optJSONArray("categories") ?: JSONArray()
        return Verdict(o.getString("niveau"), o.optInt("signalements"), o.optString("dernier").takeIf { it.isNotBlank() && it != "null" }, (0 until cats.length()).map { cats.getString(it) })
    }
}
