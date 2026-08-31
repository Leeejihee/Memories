package com.example.mymemories.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "albums")
data class AlbumEntity(
    @PrimaryKey
    val id: String = UUID.randomUUID().toString(),
    val userId: String = "default_user",
    val name: String,
    val description: String? = null,
    val coverMediaId: String? = null,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "users")
data class UserAccountEntity(
    @PrimaryKey
    val id: String = "default_user",
    val email: String = "guest@mymemories.app",
    val displayName: String = "khách",
    val avatarInitial: String = "K",
    val isCurrent: Boolean = true,
    val createdAt: Long = System.currentTimeMillis()
)
