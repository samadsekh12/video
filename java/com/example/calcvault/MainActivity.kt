package com.example.calcvault

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.AdView

class MainActivity : AppCompatActivity() {
    private lateinit var display: TextView
    private lateinit var adView: AdView
    private var operand1: String = ""
    private var operator: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Initialize AdMob
        MobileAds.initialize(this) {}

        adView = findViewById(R.id.adView)
        adView.loadAd(AdRequest.Builder().build())

        display = findViewById(R.id.display)
        setupCalculatorButtons()
    }

    private fun setupCalculatorButtons() {
        val numberButtons = listOf(
            R.id.btn0, R.id.btn1, R.id.btn2, R.id.btn3, R.id.btn4,
            R.id.btn5, R.id.btn6, R.id.btn7, R.id.btn8, R.id.btn9
        )
        numberButtons.forEach { id ->
            findViewById<Button>(id).setOnClickListener { v ->
                val digit = (v as Button).text
                if (display.text == "0") display.text = digit else display.append(digit)
            }
        }

        findViewById<Button>(R.id.btnDot).setOnClickListener {
            if (!display.text.contains(".")) display.append(".")
        }

        findViewById<Button>(R.id.btnC).setOnClickListener {
            display.text = "0"; operand1 = ""; operator = null
        }

        listOf(
            R.id.btnAdd to "+",
            R.id.btnSub to "−",
            R.id.btnMul to "×",
            R.id.btnDiv to "÷"
        ).forEach { (id, op) ->
            findViewById<Button>(id).setOnClickListener {
                operand1 = display.text.toString()
                operator = op
                display.text = "0"
            }
        }

        findViewById<Button>(R.id.btnEqual).apply {
            setOnClickListener { computeResult() }

            // Long-press to open vault
            setOnLongClickListener {
                startActivity(Intent(this@MainActivity, VaultActivity::class.java))
                true
            }
        }
    }

    private fun computeResult() {
        val operand2 = display.text.toString().toDoubleOrNull() ?: return
        val result = when (operator) {
            "+"  -> operand1.toDouble() + operand2
            "−"  -> operand1.toDouble() - operand2
            "×"  -> operand1.toDouble() * operand2
            "÷"  -> if (operand2 != 0.0) operand1.toDouble() / operand2 else return
            else -> return
        }
        display.text = if (result % 1.0 == 0.0) result.toInt().toString() else result.toString()
        operator = null
    }

    override fun onPause() { adView.pause(); super.onPause() }
    override fun onResume() { super.onResume(); adView.resume() }
    override fun onDestroy() { adView.destroy(); super.onDestroy() }
}
