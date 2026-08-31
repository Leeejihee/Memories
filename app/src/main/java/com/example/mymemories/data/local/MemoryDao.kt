package com.example.mymemories.data.local

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.mymemories.data.model.AlbumEntity
import com.example.mymemories.data.model.MemoryEntity
import com.example.mymemories.data.model.UserAccountEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface MemoryDao {
    @Query("SELECT * FROM memories WHERE userId = :userId ORDER BY createdAt DESC")
    fun getAllMemories(userId: String): Flow<List<MemoryEntity>>

    @Query("SELECT * FROM memories WHERE userId = :userId AND isFavorite = 1 ORDER BY createdAt DESC")
    fun getFavoriteMemories(userId: String): Flow<List<MemoryEntity>>

    @Query("SELECT * FROM memories WHERE userId = :userId AND albumId = :albumId ORDER BY createdAt DESC")
    fun getMemoriesByAlbum(userId: String, albumId: String): Flow<List<MemoryEntity>>

    @Query("SELECT * FROM memories WHERE id = :id LIMIT 1")
    suspend fun getMemoryById(id: String): MemoryEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMemory(memory: MemoryEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMemories(memories: List<MemoryEntity>)

    @Update
    suspend fun updateMemory(memory: MemoryEntity)

    @Delete
    suspend fun deleteMemory(memory: MemoryEntity)

    @Query("DELETE FROM memories WHERE id = :id")
    suspend fun deleteMemoryById(id: String)

    @Query("UPDATE memories SET isFavorite = NOT isFavorite WHERE id = :id")
    suspend fun toggleFavorite(id: String)

    // Albums
    @Query("SELECT * FROM albums WHERE userId = :userId ORDER BY createdAt DESC")
    fun getAllAlbums(userId: String): Flow<List<AlbumEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAlbum(album: AlbumEntity)

    @Delete
    suspend fun deleteAlbum(album: AlbumEntity)

    @Query("UPDATE albums SET coverMediaId = :mediaId WHERE id = :albumId")
    suspend fun updateAlbumCover(albumId: String, mediaId: String)

    // Users
    @Query("SELECT * FROM users WHERE isCurrent = 1 LIMIT 1")
    fun getCurrentUser(): Flow<UserAccountEntity?>

    @Query("SELECT * FROM users")
    fun getAllUsers(): Flow<List<UserAccountEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUser(user: UserAccountEntity)

    @Query("UPDATE users SET isCurrent = CASE WHEN id = :userId THEN 1 ELSE 0 END")
    suspend fun switchUser(userId: String)
}
