// AppDatabase.kt
package com.example.calcvault.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(entities = [FileMetadata::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun fileDao(): FileMetadataDao

    companion object {
        @Volatile private var INSTANCE: AppDatabase? = null

        fun getInstance(ctx: Context): AppDatabase =
            INSTANCE ?: synchronized(this) {
                Room.databaseBuilder(ctx, AppDatabase::class.java, "calcvault.db")
                    // .openHelperFactory(SQLCipher.getSupportFactory(passphrase)) // if using SQLCipher
                    .build().also { INSTANCE = it }
            }
    }
}
