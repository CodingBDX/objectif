package fr.heypapi.shield

import android.content.Context
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.drawable.GradientDrawable
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.LinearLayout
import android.widget.TextView

/** Bandeau affiché par-dessus l'écran d'appel. Toucher le bandeau le ferme ; il disparaît seul après quelques secondes. */
object Overlay {
    private var view: View? = null
    private val handler = Handler(Looper.getMainLooper())
    private val MOTIFS = mapOf("harcelement" to "Harcèlement", "menaces" to "Menaces", "impaye" to "Impayé / arnaque", "faux_rdv" to "Faux rendez-vous", "non_respect" to "Non-respect des règles", "autre" to "Autre")

    fun hide(ctx: Context) {
        val v = view ?: return; view = null
        try { (ctx.getSystemService(Context.WINDOW_SERVICE) as WindowManager).removeView(v) } catch (_: Exception) {}
    }

    fun show(ctx: Context, number: String?, v: Verdict?) {
        hide(ctx)
        val (color, title, sub, secs) = when {
            number == null -> Quad(0xFF666666.toInt(), "Numéro masqué", "Impossible de vérifier ce numéro.", 8)
            v == null -> Quad(0xFF666666.toInt(), "Vérification impossible", "Pas de connexion, ou tu n'es pas connecté(e) dans l'application.", 6)
            v.niveau == "danger" -> Quad(0xFFC0213D.toInt(), "🔴 DANGER · ${v.n} signalements", detail(v), 25)
            v.niveau == "attention" -> Quad(0xFFD98200.toInt(), "🟠 ATTENTION · 1 signalement", detail(v), 20)
            else -> Quad(0xFF1E8A4C.toInt(), "🟢 Aucun signalement", "Ce numéro n'a pas été signalé. Reste prudent(e).", 6)
        }
        val ctxd = ctx.applicationContext; val d = ctxd.resources.displayMetrics.density
        val box = LinearLayout(ctxd).apply {
            orientation = LinearLayout.VERTICAL; setPadding((16 * d).toInt(), (12 * d).toInt(), (16 * d).toInt(), (12 * d).toInt())
            background = GradientDrawable().apply { setColor(color); cornerRadius = 18 * d }
            elevation = 12 * d
            addView(TextView(ctxd).apply { text = title; setTextColor(Color.WHITE); textSize = 18f; setTypeface(typeface, android.graphics.Typeface.BOLD) })
            addView(TextView(ctxd).apply { text = (number?.let { "$it\n" } ?: "") + sub; setTextColor(Color.WHITE); textSize = 14f })
            setOnClickListener { hide(ctxd) }
        }
        val lp = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        ).apply { gravity = Gravity.TOP; x = 0; y = (40 * d).toInt(); horizontalMargin = 0.03f }
        (ctxd.getSystemService(Context.WINDOW_SERVICE) as WindowManager).addView(box, lp)
        view = box
        handler.removeCallbacksAndMessages(null); handler.postDelayed({ hide(ctxd) }, secs * 1000L)
    }

    private fun detail(v: Verdict): String {
        val m = v.motifs.joinToString(", ") { MOTIFS[it] ?: it }
        return (if (m.isNotEmpty()) "Motifs : $m" else "") + (v.dernier?.let { "\nDernier signalement : $it" } ?: "")
    }
    private data class Quad(val a: Int, val b: String, val c: String, val d: Int)
}
