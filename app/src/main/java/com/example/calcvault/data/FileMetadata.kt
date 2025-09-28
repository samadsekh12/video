package com.example.calcvault.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "files")
data class FileMetadata(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val size: Long,
    val importedAt: Long,
    val path: String
)
