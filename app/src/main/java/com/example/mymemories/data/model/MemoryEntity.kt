package com.example.mymemories.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "memories")
data class MemoryEntity(
    @PrimaryKey
    val id: String = UUID.randomUUID().toString(),
    val userId: String = "default_user",
    val fileName: String,
    val mimeType: String = "image/jpeg",
    val source: String = "external_url",
    val storageKey: String,
    val title: String? = null,
    val description: String? = null,
    val takenAt: String? = null, // e.g. "2024-05-24" or ISO string
    val aiTags: List<String> = emptyList(),
    val isFavorite: Boolean = false,
    val albumId: String? = null,
    val location: String? = null,
    val createdAt: Long = System.currentTimeMillis()
)
