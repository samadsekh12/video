// EncryptedConverter.kt
package com.example.calcvault.data

import androidx.room.TypeConverter
import androidx.security.crypto.EncryptedFile
// (If you choose SQLCipher, implement here)
class EncryptedConverter {
    @TypeConverter fun fromList(value: List<String>) = /*...*/
    @TypeConverter fun toList(value: String) = /*...*/
}
