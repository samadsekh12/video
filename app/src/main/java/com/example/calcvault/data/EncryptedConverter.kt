package com.example.calcvault.data

import androidx.room.TypeConverter

class EncryptedConverter {
    @TypeConverter
    fun fromString(value: String): String = value

    @TypeConverter
    fun toString(value: String): String = value
}
