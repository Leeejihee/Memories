package com.example.mymemories.data.repository

import com.example.mymemories.data.local.MemoryDao
import com.example.mymemories.data.model.AlbumEntity
import com.example.mymemories.data.model.MemoryEntity
import com.example.mymemories.data.model.UserAccountEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

class MemoryRepository(private val memoryDao: MemoryDao) {

    fun getMemoriesFlow(userId: String): Flow<List<MemoryEntity>> =
        memoryDao.getAllMemories(userId)

    fun getFavoritesFlow(userId: String): Flow<List<MemoryEntity>> =
        memoryDao.getFavoriteMemories(userId)

    fun getAlbumsFlow(userId: String): Flow<List<AlbumEntity>> =
        memoryDao.getAllAlbums(userId)

    fun getMemoriesByAlbumFlow(userId: String, albumId: String): Flow<List<MemoryEntity>> =
        memoryDao.getMemoriesByAlbum(userId, albumId)

    fun getCurrentUserFlow(): Flow<UserAccountEntity?> =
        memoryDao.getCurrentUser()

    fun getAllUsersFlow(): Flow<List<UserAccountEntity>> =
        memoryDao.getAllUsers()

    suspend fun insertMemory(memory: MemoryEntity) = withContext(Dispatchers.IO) {
        memoryDao.insertMemory(memory)
    }

    suspend fun updateMemory(memory: MemoryEntity) = withContext(Dispatchers.IO) {
        memoryDao.updateMemory(memory)
    }

    suspend fun deleteMemory(memoryId: String) = withContext(Dispatchers.IO) {
        memoryDao.deleteMemoryById(memoryId)
    }

    suspend fun toggleFavorite(memoryId: String) = withContext(Dispatchers.IO) {
        memoryDao.toggleFavorite(memoryId)
    }

    suspend fun createAlbum(userId: String, name: String, description: String? = null): AlbumEntity = withContext(Dispatchers.IO) {
        val album = AlbumEntity(
            id = UUID.randomUUID().toString(),
            userId = userId,
            name = name,
            description = description
        )
        memoryDao.insertAlbum(album)
        album
    }

    suspend fun deleteAlbum(album: AlbumEntity) = withContext(Dispatchers.IO) {
        memoryDao.deleteAlbum(album)
    }

    suspend fun switchOrAddUser(email: String, displayName: String): UserAccountEntity = withContext(Dispatchers.IO) {
        val userId = email.lowercase().trim()
        val initial = (displayName.ifBlank { email }).take(1).uppercase()
        val user = UserAccountEntity(
            id = userId,
            email = email,
            displayName = displayName.ifBlank { email.substringBefore("@") },
            avatarInitial = initial,
            isCurrent = true
        )
        memoryDao.insertUser(user)
        memoryDao.switchUser(userId)
        user
    }

    suspend fun seedInitialDataIfNeeded(userId: String = "default_user") = withContext(Dispatchers.IO) {
        val existing = memoryDao.getAllMemories(userId).firstOrNull()
        if (existing.isNullOrEmpty()) {
            val defaultUser = UserAccountEntity(
                id = userId,
                email = "guest@mymemories.app",
                displayName = "khách",
                avatarInitial = "K",
                isCurrent = true
            )
            memoryDao.insertUser(defaultUser)

            val travelAlbum = AlbumEntity(
                id = "album-travel",
                userId = userId,
                name = "Chuyến đi & Khám phá",
                description = "Những cung đường và miền đất đã qua"
            )
            val lifeAlbum = AlbumEntity(
                id = "album-life",
                userId = userId,
                name = "Khoảnh khắc thường ngày",
                description = "Cà phê, bạn bè và những chiều bình yên"
            )
            memoryDao.insertAlbum(travelAlbum)
            memoryDao.insertAlbum(lifeAlbum)

            val demoMemories = listOf(
                MemoryEntity(
                    id = "demo-1",
                    userId = userId,
                    fileName = "dalat.jpg",
                    mimeType = "image/jpeg",
                    source = "external_url",
                    storageKey = "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=85",
                    title = "Đà Lạt trong sương",
                    description = "Một sớm mai mù sương se lạnh giữa đồi thông ngút ngàn, tiếng chim ríu rít và hương hoa thoang thoảng.",
                    takenAt = "2024-05-24",
                    aiTags = listOf("Đà Lạt", "du lịch", "núi rừng", "sương sớm"),
                    isFavorite = true,
                    albumId = "album-travel",
                    location = "Đà Lạt, Lâm Đồng",
                    createdAt = System.currentTimeMillis() - 86400000L * 90
                ),
                MemoryEntity(
                    id = "demo-2",
                    userId = userId,
                    fileName = "sunset.jpg",
                    mimeType = "image/jpeg",
                    source = "external_url",
                    storageKey = "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85",
                    title = "Chiều bình yên",
                    description = "Mặt trời lặn nhuộm vàng cả góc trời, ngắm hoàng hôn buông xuống thật êm đềm.",
                    takenAt = "2024-06-02",
                    aiTags = listOf("hoàng hôn", "thiên nhiên", "yên bình"),
                    isFavorite = true,
                    albumId = "album-travel",
                    location = "Hồ Tây, Hà Nội",
                    createdAt = System.currentTimeMillis() - 86400000L * 60
                ),
                MemoryEntity(
                    id = "demo-3",
                    userId = userId,
                    fileName = "friends.jpg",
                    mimeType = "image/jpeg",
                    source = "external_url",
                    storageKey = "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=85",
                    title = "Ngày bên nhau",
                    description = "Tụ họp cùng những người bạn thân thiết, nói cười rôm rả dưới ánh nắng rực rỡ.",
                    takenAt = "2023-08-30",
                    aiTags = listOf("bạn bè", "kỷ niệm", "nụ cười"),
                    isFavorite = false,
                    albumId = "album-life",
                    location = "Công viên Thống Nhất",
                    createdAt = System.currentTimeMillis() - 86400000L * 365
                ),
                MemoryEntity(
                    id = "demo-4",
                    userId = userId,
                    fileName = "coffee.jpg",
                    mimeType = "image/jpeg",
                    source = "external_url",
                    storageKey = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85",
                    title = "Một tách cà phê",
                    description = "Góc quán quen, cuốn sách hay và một tách cà phê thơm lừng trong buổi chiều mưa.",
                    takenAt = "2023-09-14",
                    aiTags = listOf("cà phê", "sách", "thư giãn"),
                    isFavorite = false,
                    albumId = "album-life",
                    location = "Phố Cổ, Hà Nội",
                    createdAt = System.currentTimeMillis() - 86400000L * 350
                ),
                MemoryEntity(
                    id = "demo-5",
                    userId = userId,
                    fileName = "hoian.jpg",
                    mimeType = "image/jpeg",
                    source = "external_url",
                    storageKey = "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=85",
                    title = "Phố đèn lồng Hội An",
                    description = "Những chiếc đèn lồng đủ sắc màu rực rỡ bên dòng sông Hoài thơ mộng.",
                    takenAt = "2024-03-15",
                    aiTags = listOf("Hội An", "du lịch", "đèn lồng", "phố cổ"),
                    isFavorite = true,
                    albumId = "album-travel",
                    location = "Hội An, Quảng Nam",
                    createdAt = System.currentTimeMillis() - 86400000L * 150
                ),
                MemoryEntity(
                    id = "demo-6",
                    userId = userId,
                    fileName = "beach.jpg",
                    mimeType = "image/jpeg",
                    source = "external_url",
                    storageKey = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85",
                    title = "Biển xanh cát trắng",
                    description = "Làn nước trong vắt và tiếng sóng vỗ rì rào xua tan mọi mệt mỏi.",
                    takenAt = "2024-07-20",
                    aiTags = listOf("biển", "mùa hè", "nghỉ dưỡng"),
                    isFavorite = false,
                    albumId = "album-travel",
                    location = "Nha Trang, Khánh Hòa",
                    createdAt = System.currentTimeMillis() - 86400000L * 30
                )
            )
            memoryDao.insertMemories(demoMemories)
        }
    }
}
