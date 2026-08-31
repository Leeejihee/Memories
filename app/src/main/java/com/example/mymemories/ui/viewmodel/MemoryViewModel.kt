package com.example.mymemories.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.mymemories.data.local.AppDatabase
import com.example.mymemories.data.model.AlbumEntity
import com.example.mymemories.data.model.MemoryEntity
import com.example.mymemories.data.model.UserAccountEntity
import com.example.mymemories.data.repository.MemoryRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

enum class AppDestination(val id: String, val title: String) {
    HOME("home", "Trang chủ"),
    MEDIA("media", "Hình ảnh"),
    ALBUMS("albums", "Album"),
    FAVORITES("favorites", "Yêu thích"),
    TIMELINE("timeline", "Timeline"),
    AI_SEARCH("ai", "AI tìm kiếm"),
    SETTINGS("settings", "Cài đặt")
}

data class UiState(
    val currentDestination: AppDestination = AppDestination.HOME,
    val searchQuery: String = "",
    val selectedTag: String? = null,
    val selectedAlbumId: String? = null,
    val selectedMemory: MemoryEntity? = null,
    val showAddDialog: Boolean = false,
    val showAuthDialog: Boolean = false,
    val showCreateAlbumDialog: Boolean = false,
    val toastMessage: String? = null,
    val isGridView: Boolean = true
)

class MemoryViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: MemoryRepository
    private val _uiState = MutableStateFlow(UiState())
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    private val _currentUserId = MutableStateFlow("default_user")

    init {
        val database = AppDatabase.getInstance(application)
        repository = MemoryRepository(database.memoryDao())
        viewModelScope.launch {
            repository.seedInitialDataIfNeeded("default_user")
        }
    }

    val currentUser: StateFlow<UserAccountEntity?> = repository.getCurrentUserFlow()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val allUsers: StateFlow<List<UserAccountEntity>> = repository.getAllUsersFlow()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val albums: StateFlow<List<AlbumEntity>> = _currentUserId.flatMapLatest { userId ->
        repository.getAlbumsFlow(userId)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val allMemories: StateFlow<List<MemoryEntity>> = _currentUserId.flatMapLatest { userId ->
        repository.getMemoriesFlow(userId)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val favoriteMemories: StateFlow<List<MemoryEntity>> = _currentUserId.flatMapLatest { userId ->
        repository.getFavoritesFlow(userId)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Filtered memories based on current tab, search query, selected tag, selected album
    val filteredMemories: StateFlow<List<MemoryEntity>> = combine(
        allMemories,
        _uiState
    ) { memories, state ->
        var list = when (state.currentDestination) {
            AppDestination.FAVORITES -> memories.filter { it.isFavorite }
            else -> memories
        }

        if (state.selectedAlbumId != null) {
            list = list.filter { it.albumId == state.selectedAlbumId }
        }

        if (state.selectedTag != null) {
            list = list.filter { it.aiTags.any { tag -> tag.equals(state.selectedTag, ignoreCase = true) } }
        }

        if (state.searchQuery.isNotBlank()) {
            val q = state.searchQuery.trim().lowercase()
            list = list.filter { item ->
                (item.title?.lowercase()?.contains(q) == true) ||
                item.fileName.lowercase().contains(q) ||
                (item.description?.lowercase()?.contains(q) == true) ||
                (item.location?.lowercase()?.contains(q) == true) ||
                item.aiTags.any { it.lowercase().contains(q) }
            }
        }

        list
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Memories on this day (same month & day in past years)
    val todayMemories: StateFlow<List<MemoryEntity>> = allMemories.flatMapLatest { memories ->
        val todayStr = SimpleDateFormat("MM-dd", Locale.getDefault()).format(Date())
        val matching = memories.filter { memory ->
            memory.takenAt?.let {
                if (it.length >= 10) it.substring(5, 10) == todayStr else false
            } ?: false
        }
        MutableStateFlow(matching)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // All distinct tags across user's memories
    val allTags: StateFlow<List<String>> = allMemories.flatMapLatest { memories ->
        val tags = memories.flatMap { it.aiTags }.distinct()
        MutableStateFlow(tags)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun setDestination(dest: AppDestination) {
        _uiState.value = _uiState.value.copy(
            currentDestination = dest,
            selectedTag = if (dest != AppDestination.AI_SEARCH && dest != AppDestination.MEDIA) null else _uiState.value.selectedTag,
            selectedAlbumId = if (dest != AppDestination.ALBUMS) null else _uiState.value.selectedAlbumId
        )
    }

    fun setSearchQuery(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
    }

    fun setSelectedTag(tag: String?) {
        _uiState.value = _uiState.value.copy(selectedTag = if (_uiState.value.selectedTag == tag) null else tag)
    }

    fun setSelectedAlbum(albumId: String?) {
        _uiState.value = _uiState.value.copy(selectedAlbumId = albumId)
    }

    fun setSelectedMemory(memory: MemoryEntity?) {
        _uiState.value = _uiState.value.copy(selectedMemory = memory)
    }

    fun setShowAddDialog(show: Boolean) {
        _uiState.value = _uiState.value.copy(showAddDialog = show)
    }

    fun setShowAuthDialog(show: Boolean) {
        _uiState.value = _uiState.value.copy(showAuthDialog = show)
    }

    fun setShowCreateAlbumDialog(show: Boolean) {
        _uiState.value = _uiState.value.copy(showCreateAlbumDialog = show)
    }

    fun toggleGridView() {
        _uiState.value = _uiState.value.copy(isGridView = !_uiState.value.isGridView)
    }

    fun showToast(msg: String) {
        _uiState.value = _uiState.value.copy(toastMessage = msg)
    }

    fun dismissToast() {
        _uiState.value = _uiState.value.copy(toastMessage = null)
    }

    fun toggleFavorite(memory: MemoryEntity) {
        viewModelScope.launch {
            repository.toggleFavorite(memory.id)
            if (_uiState.value.selectedMemory?.id == memory.id) {
                _uiState.value = _uiState.value.copy(
                    selectedMemory = memory.copy(isFavorite = !memory.isFavorite)
                )
            }
            val status = if (!memory.isFavorite) "Đã thêm vào mục Yêu thích" else "Đã bỏ khỏi Yêu thích"
            showToast(status)
        }
    }

    fun addMemory(
        url: String,
        title: String,
        description: String? = null,
        takenAt: String? = null,
        tags: List<String> = emptyList(),
        albumId: String? = null,
        location: String? = null
    ) {
        if (url.isBlank()) return
        val currentUserId = _currentUserId.value
        val newMemory = MemoryEntity(
            id = UUID.randomUUID().toString(),
            userId = currentUserId,
            fileName = title.ifBlank { "Kỷ niệm mới" },
            mimeType = "image/jpeg",
            source = "external_url",
            storageKey = url.trim(),
            title = title.ifBlank { "Kỷ niệm mới" },
            description = description?.ifBlank { null },
            takenAt = takenAt ?: SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date()),
            aiTags = tags.ifEmpty { listOf("kỷ niệm") },
            isFavorite = false,
            albumId = albumId,
            location = location?.ifBlank { null },
            createdAt = System.currentTimeMillis()
        )
        viewModelScope.launch {
            repository.insertMemory(newMemory)
            showToast("Đã thêm khoảnh khắc vào không gian riêng của bạn.")
            setShowAddDialog(false)
        }
    }

    fun deleteMemory(memoryId: String) {
        viewModelScope.launch {
            repository.deleteMemory(memoryId)
            if (_uiState.value.selectedMemory?.id == memoryId) {
                _uiState.value = _uiState.value.copy(selectedMemory = null)
            }
            showToast("Đã xóa kỷ niệm.")
        }
    }

    fun createAlbum(name: String, description: String? = null) {
        if (name.isBlank()) return
        viewModelScope.launch {
            repository.createAlbum(_currentUserId.value, name.trim(), description?.trim())
            showToast("Đã tạo album \"$name\"")
            setShowCreateAlbumDialog(false)
        }
    }

    fun deleteAlbum(album: AlbumEntity) {
        viewModelScope.launch {
            repository.deleteAlbum(album)
            if (_uiState.value.selectedAlbumId == album.id) {
                _uiState.value = _uiState.value.copy(selectedAlbumId = null)
            }
            showToast("Đã xóa album \"${album.name}\"")
        }
    }

    fun switchOrLoginUser(email: String, displayName: String) {
        if (email.isBlank()) return
        viewModelScope.launch {
            val user = repository.switchOrAddUser(email, displayName)
            _currentUserId.value = user.id
            repository.seedInitialDataIfNeeded(user.id)
            setShowAuthDialog(false)
            showToast("Chào mừng bạn trở lại, ${user.displayName}!")
        }
    }

    fun resetDemoData() {
        viewModelScope.launch {
            repository.seedInitialDataIfNeeded(_currentUserId.value)
            showToast("Đã làm mới dữ liệu mẫu.")
        }
    }
}
