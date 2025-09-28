package com.example.calcvault.utils

import android.content.Context
import android.net.Uri
import java.io.File
import java.io.FileOutputStream
import javax.crypto.Cipher
import javax.crypto.CipherOutputStream
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

object EncryptionUtils {
    private const val ANDROID_KEYSTORE = "AndroidKeyStore"
    private const val KEY_ALIAS = "CalcVaultKey"
    private const val TRANSFORMATION = "AES/GCM/NoPadding"

    private fun getOrCreateSecretKey(): SecretKey {
        val ks = java.security.KeyStore.getInstance(ANDROID_KEYSTORE).apply { load(null) }
        if (!ks.containsAlias(KEY_ALIAS)) {
            val kg = javax.crypto.KeyGenerator.getInstance("AES", ANDROID_KEYSTORE)
            val spec = android.security.keystore.KeyGenParameterSpec.Builder(
                KEY_ALIAS,
                android.security.keystore.KeyProperties.PURPOSE_ENCRYPT or
                        android.security.keystore.KeyProperties.PURPOSE_DECRYPT
            ).setBlockModes(android.security.keystore.KeyProperties.BLOCK_MODE_GCM)
             .setEncryptionPaddings(android.security.keystore.KeyProperties.ENCRYPTION_PADDING_NONE)
             .build()
            kg.init(spec); kg.generateKey()
        }
        return (ks.getEntry(KEY_ALIAS, null) as java.security.KeyStore.SecretKeyEntry).secretKey
    }

    fun encryptUri(ctx: Context, uri: Uri, outFile: File) {
        val key = getOrCreateSecretKey()
        val cipher = Cipher.getInstance(TRANSFORMATION).apply { init(Cipher.ENCRYPT_MODE, key) }
        val iv = cipher.iv

        FileOutputStream(outFile).use { fos ->
            fos.write(iv.size)
            fos.write(iv)
            ctx.contentResolver.openInputStream(uri)?.use { ins ->
                CipherOutputStream(fos, cipher).use { cos -> ins.copyTo(cos) }
            }
        }
    }

    fun decryptFile(inFile: File, output: java.io.OutputStream) {
        val data = inFile.readBytes()
        val ivLen = data[0].toInt()
        val iv = data.copyOfRange(1, 1 + ivLen)
        val cipherText = data.copyOfRange(1 + ivLen, data.size)

        val key = getOrCreateSecretKey()
        val cipher = Cipher.getInstance(TRANSFORMATION)
            .apply { init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(128, iv)) }

        output.use { out ->
            out.write(cipher.doFinal(cipherText))
        }
    }
}
