// FileMetadataDao.kt
package com.example.calcvault.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query

@Dao
interface FileMetadataDao {
    @Insert suspend fun insert(file: FileMetadata)
    @Query("SELECT * FROM files ORDER BY importedAt DESC") suspend fun getAll(): List<FileMetadata>
}
