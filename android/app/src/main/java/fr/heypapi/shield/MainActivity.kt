package fr.heypapi.shield

import android.app.role.RoleManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import kotlin.concurrent.thread

/** Écran unique : connexion avec le compte Sex-Escorte, puis deux autorisations (affichage par-dessus les autres applications + filtrage d'appels). */
class MainActivity : ComponentActivity() {
    private lateinit var root: LinearLayout
    private val roleLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { render() }

    override fun onCreate(b: Bundle?) { super.onCreate(b); root = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; val p = (24 * resources.displayMetrics.density).toInt(); setPadding(p, p * 2, p, p) }; setContentView(root); render() }
    override fun onResume() { super.onResume(); if (::root.isInitialized) render() }

    private fun t(s: String, size: Float = 15f, bold: Boolean = false) = TextView(this).apply { text = s; textSize = size; setPadding(0, 12, 0, 12); if (bold) setTypeface(typeface, android.graphics.Typeface.BOLD) }
    private fun btn(s: String, f: () -> Unit) = Button(this).apply { text = s; setOnClickListener { f() } }

    private fun hasRole() = (getSystemService(Context.ROLE_SERVICE) as RoleManager).isRoleHeld(RoleManager.ROLE_CALL_SCREENING)

    private fun render() {
        root.removeAllViews()
        root.addView(t("🛡️ Sex-Escorte Shield", 24f, true))
        if (BuildConfig.SUPABASE_URL.isEmpty()) { root.addView(t("Configuration manquante : renseigne SUPABASE_URL et SUPABASE_KEY dans local.properties, puis recompile.")); return }
        if (!Api.loggedIn(this)) {
            root.addView(t("Connecte-toi avec ton compte Sex-Escorte (le même que sur le site). Il faut avoir un profil."))
            val mail = EditText(this).apply { hint = "E-mail"; inputType = android.text.InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS or android.text.InputType.TYPE_CLASS_TEXT }
            val pw = EditText(this).apply { hint = "Mot de passe"; inputType = android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD }
            val msg = t("", 14f)
            root.addView(mail); root.addView(pw); root.addView(msg)
            root.addView(btn("Se connecter") {
                msg.text = "Connexion…"
                thread { val e = Api.login(this, mail.text.toString().trim(), pw.text.toString()); runOnUiThread { if (e == null) render() else msg.text = e } }
            })
            return
        }
        val overlay = Settings.canDrawOverlays(this); val role = hasRole()
        root.addView(t("Compte connecté ✔"))
        root.addView(t(if (overlay) "✔ Affichage par-dessus les autres applications : autorisé" else "✖ Affichage par-dessus les autres applications : à autoriser"))
        if (!overlay) root.addView(btn("Autoriser l'affichage") { startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:$packageName"))) })
        root.addView(t(if (role) "✔ Application de filtrage d'appels : activée" else "✖ Application de filtrage d'appels : à activer"))
        if (!role) root.addView(btn("Activer le filtrage d'appels") { roleLauncher.launch((getSystemService(Context.ROLE_SERVICE) as RoleManager).createRequestRoleIntent(RoleManager.ROLE_CALL_SCREENING)) })
        if (overlay && role) root.addView(t("Tout est prêt. Quand tu reçois un appel, un bandeau vert, orange ou rouge s'affiche par-dessus l'écran d'appel. L'appel sonne toujours normalement.", 15f))
        root.addView(t("Les numéros sont envoyés de façon sécurisée à ton compte Sex-Escorte pour être comparés ; ils ne sont pas conservés en clair.", 12f))
        root.addView(btn("Se déconnecter") { Api.logout(this); render() })
    }
}
