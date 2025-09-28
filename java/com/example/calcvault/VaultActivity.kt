package com.example.calcvault

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.os.SystemClock
import android.widget.Button
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.calcvault.data.AppDatabase
import com.example.calcvault.data.FileMetadata
import com.example.calcvault.utils.EncryptionUtils
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.InterstitialAd
import com.google.android.gms.ads.InterstitialAdLoadCallback
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.util.concurrent.Executor

class VaultActivity : AppCompatActivity() {
    private lateinit var db: AppDatabase
    private lateinit var importBtn: Button
    private lateinit var exportBtn: Button
    private lateinit var recycler: RecyclerView
    private var interstitial: InterstitialAd? = null

    private val pickFileLauncher = registerForActivityResult(
        ActivityResultContracts.OpenDocument()
    ) { uri ->
        uri?.let { encryptAndStore(it) }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_vault)

        db = AppDatabase.getInstance(this)
        importBtn = findViewById(R.id.btnImport)
        exportBtn = findViewById(R.id.btnExport)
        recycler = findViewById(R.id.recyclerFiles)
        recycler.layoutManager = LinearLayoutManager(this)

        // Biometric or PIN prompt (simplified)
        promptBiometric()

        loadInterstitialAd()
        observeFiles()

        importBtn.setOnClickListener {
            pickFileLauncher.launch(arrayOf("*/*"))
        }

        exportBtn.setOnClickListener {
            showInterstitial { exportAllFiles() }
        }
    }

    private fun promptBiometric() {
        val executor: Executor = ContextCompat.getMainExecutor(this)
        val prompt = BiometricPrompt(this, executor,
            object: BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) { /* proceed */ }
                override fun onAuthenticationError(code: Int, msg: CharSequence) {
                    super.onAuthenticationError(code, msg); finish()
                }
            })
        val config = BiometricPrompt.PromptInfo.Builder()
            .setTitle("Unlock Vault")
            .setAllowedAuthenticators(androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_STRONG)
            .build()
        prompt.authenticate(config)
    }

    private fun encryptAndStore(uri: android.net.Uri) {
        lifecycleScope.launch {
            val fileName = "${System.currentTimeMillis()}.enc"
            val outFile = File(filesDir, fileName)

            withContext(Dispatchers.IO) {
                EncryptionUtils.encryptUri(this@VaultActivity, uri, outFile)
                val meta = FileMetadata(0, fileName, outFile.length(), System.currentTimeMillis())
                db.fileDao().insert(meta)
            }

            Toast.makeText(this@VaultActivity, "$fileName saved", Toast.LENGTH_SHORT).show()
            observeFiles()
        }
    }

    private fun exportAllFiles() {
        // Simplified: decrypt each into Downloads/
        lifecycleScope.launch {
            val list = db.fileDao().getAll()
            list.forEach { meta ->
                val inFile = File(filesDir, meta.name)
                val outUri = saveToDownloads(meta.name.removeSuffix(".enc"))
                withContext(Dispatchers.IO) {
                    EncryptionUtils.decryptFile(inFile, contentResolver.openOutputStream(outUri)!!)
                }
            }
            Toast.makeText(this@VaultActivity, "Export complete", Toast.LENGTH_SHORT).show()
        }
    }

    private fun observeFiles() {
        lifecycleScope.launch {
            val files = withContext(Dispatchers.IO) { db.fileDao().getAll() }
            recycler.adapter = FileListAdapter(files)
        }
    }

    private fun saveToDownloads(fileName: String): android.net.Uri {
        val intent = Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "*/*"
            putExtra(Intent.EXTRA_TITLE, fileName)
        }
        val result = pickFileLauncher.launch(arrayOf("*/*"))
        // For brevity, return same URI
        return uri!!
    }

    private fun loadInterstitialAd() {
        InterstitialAd.load(
            this,
            "ca-app-pub-3940256099942544/1033173712",
            AdRequest.Builder().build(),
            object: InterstitialAdLoadCallback() {
                override fun onAdLoaded(ad: InterstitialAd) { interstitial = ad }
                override fun onAdFailedToLoad(p0: LoadAdError) { interstitial = null }
            }
        )
    }

    private fun showInterstitial(onComplete: ()->Unit) {
        interstitial?.let { ad ->
            ad.fullScreenContentCallback = object: FullScreenContentCallback() {
                override fun onAdDismissedFullScreenContent() { onComplete(); loadInterstitialAd() }
            }
            ad.show(this)
        } ?: onComplete()
    }
}
