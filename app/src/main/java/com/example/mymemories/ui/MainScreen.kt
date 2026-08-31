package com.example.mymemories.ui

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.outlined.AutoAwesome
import androidx.compose.material.icons.outlined.Collections
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Image
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material.icons.outlined.Timeline
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.FloatingActionButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.NavigationRail
import androidx.compose.material3.NavigationRailItem
import androidx.compose.material3.NavigationRailItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Snackbar
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.mymemories.ui.components.AddMemoryDialog
import com.example.mymemories.ui.components.AuthDialog
import com.example.mymemories.ui.components.CreateAlbumDialog
import com.example.mymemories.ui.components.MemoryDetailDialog
import com.example.mymemories.ui.screens.AiSearchScreen
import com.example.mymemories.ui.screens.AlbumsScreen
import com.example.mymemories.ui.screens.FavoritesScreen
import com.example.mymemories.ui.screens.HomeScreen
import com.example.mymemories.ui.screens.MediaScreen
import com.example.mymemories.ui.screens.SettingsScreen
import com.example.mymemories.ui.screens.TimelineScreen
import com.example.mymemories.ui.theme.MemoryCardCream
import com.example.mymemories.ui.theme.MemoryCream
import com.example.mymemories.ui.theme.MemoryInk
import com.example.mymemories.ui.theme.MemoryLine
import com.example.mymemories.ui.theme.MemoryMuted
import com.example.mymemories.ui.theme.MemorySage
import com.example.mymemories.ui.theme.MemoryTerracotta
import com.example.mymemories.ui.viewmodel.AppDestination
import com.example.mymemories.ui.viewmodel.MemoryViewModel

data class NavItemSpec(
    val destination: AppDestination,
    val title: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
)

val NAV_ITEMS = listOf(
    NavItemSpec(AppDestination.HOME, "Trang chủ", Icons.Filled.Home, Icons.Outlined.Home),
    NavItemSpec(AppDestination.MEDIA, "Hình ảnh", Icons.Outlined.Image, Icons.Outlined.Image),
    NavItemSpec(AppDestination.ALBUMS, "Album", Icons.Outlined.Collections, Icons.Outlined.Collections),
    NavItemSpec(AppDestination.FAVORITES, "Yêu thích", Icons.Filled.Favorite, Icons.Outlined.FavoriteBorder),
    NavItemSpec(AppDestination.TIMELINE, "Timeline", Icons.Outlined.Timeline, Icons.Outlined.Timeline),
    NavItemSpec(AppDestination.AI_SEARCH, "AI Search", Icons.Outlined.AutoAwesome, Icons.Outlined.AutoAwesome),
    NavItemSpec(AppDestination.SETTINGS, "Cài đặt", Icons.Filled.Settings, Icons.Outlined.Settings)
)

@Composable
fun MainScreen(
    viewModel: MemoryViewModel
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val currentUser by viewModel.currentUser.collectAsStateWithLifecycle()
    val allUsers by viewModel.allUsers.collectAsStateWithLifecycle()
    val filteredMemories by viewModel.filteredMemories.collectAsStateWithLifecycle()
    val allMemories by viewModel.allMemories.collectAsStateWithLifecycle()
    val albums by viewModel.albums.collectAsStateWithLifecycle()
    val allTags by viewModel.allTags.collectAsStateWithLifecycle()
    val todayMemories by viewModel.todayMemories.collectAsStateWithLifecycle()

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(uiState.toastMessage) {
        uiState.toastMessage?.let { message ->
            snackbarHostState.showSnackbar(message)
            viewModel.dismissToast()
        }
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = MemoryCream,
        topBar = {
            MainTopBar(
                displayName = currentUser?.displayName ?: "khách",
                avatarInitial = currentUser?.avatarInitial ?: "K",
                onAvatarClick = { viewModel.setShowAuthDialog(true) },
                onSearchClick = { viewModel.setDestination(AppDestination.AI_SEARCH) }
            )
        },
        bottomBar = {
            MainBottomNavBar(
                currentDestination = uiState.currentDestination,
                onNavigate = { dest -> viewModel.setDestination(dest) }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { viewModel.setShowAddDialog(true) },
                containerColor = MemoryInk,
                contentColor = Color.White,
                shape = CircleShape,
                elevation = FloatingActionButtonDefaults.elevation(6.dp),
                modifier = Modifier
                    .padding(bottom = 8.dp)
                    .testTag("main_add_memory_fab")
            ) {
                Icon(Icons.Filled.Add, contentDescription = "Thêm kỷ niệm")
            }
        },
        snackbarHost = {
            SnackbarHost(hostState = snackbarHostState) { data ->
                Snackbar(
                    containerColor = MemoryInk,
                    contentColor = Color.White,
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(data.visuals.message, fontSize = 13.sp)
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(MemoryCream)
        ) {
            AnimatedContent(
                targetState = uiState.currentDestination,
                transitionSpec = { fadeIn() togetherWith fadeOut() },
                label = "screen_transition"
            ) { destination ->
                when (destination) {
                    AppDestination.HOME -> HomeScreen(
                        memories = filteredMemories,
                        allTags = allTags,
                        selectedTag = uiState.selectedTag,
                        todayMemories = todayMemories,
                        onSelectTag = { tag -> viewModel.setSelectedTag(tag) },
                        onMemoryClick = { mem -> viewModel.setSelectedMemory(mem) },
                        onToggleFavorite = { mem -> viewModel.toggleFavorite(mem) },
                        onAddMemoryClick = { viewModel.setShowAddDialog(true) },
                        onNavigate = { dest -> viewModel.setDestination(dest) }
                    )
                    AppDestination.MEDIA -> MediaScreen(
                        memories = filteredMemories,
                        allTags = allTags,
                        selectedTag = uiState.selectedTag,
                        isGridView = uiState.isGridView,
                        onToggleView = { viewModel.toggleGridView() },
                        onSelectTag = { tag -> viewModel.setSelectedTag(tag) },
                        onMemoryClick = { mem -> viewModel.setSelectedMemory(mem) },
                        onToggleFavorite = { mem -> viewModel.toggleFavorite(mem) }
                    )
                    AppDestination.ALBUMS -> AlbumsScreen(
                        albums = albums,
                        allMemories = allMemories,
                        selectedAlbumId = uiState.selectedAlbumId,
                        onSelectAlbum = { id -> viewModel.setSelectedAlbum(id) },
                        onCreateAlbumClick = { viewModel.setShowCreateAlbumDialog(true) },
                        onDeleteAlbum = { album -> viewModel.deleteAlbum(album) },
                        onMemoryClick = { mem -> viewModel.setSelectedMemory(mem) },
                        onToggleFavorite = { mem -> viewModel.toggleFavorite(mem) }
                    )
                    AppDestination.FAVORITES -> FavoritesScreen(
                        memories = allMemories,
                        onMemoryClick = { mem -> viewModel.setSelectedMemory(mem) },
                        onToggleFavorite = { mem -> viewModel.toggleFavorite(mem) }
                    )
                    AppDestination.TIMELINE -> TimelineScreen(
                        memories = allMemories,
                        onMemoryClick = { mem -> viewModel.setSelectedMemory(mem) },
                        onToggleFavorite = { mem -> viewModel.toggleFavorite(mem) }
                    )
                    AppDestination.AI_SEARCH -> AiSearchScreen(
                        searchQuery = uiState.searchQuery,
                        memories = filteredMemories,
                        allTags = allTags,
                        onQueryChange = { q -> viewModel.setSearchQuery(q) },
                        onMemoryClick = { mem -> viewModel.setSelectedMemory(mem) },
                        onToggleFavorite = { mem -> viewModel.toggleFavorite(mem) }
                    )
                    AppDestination.SETTINGS -> SettingsScreen(
                        currentUser = currentUser,
                        memories = allMemories,
                        albums = albums,
                        onOpenAuthDialog = { viewModel.setShowAuthDialog(true) },
                        onResetDemoData = { viewModel.resetDemoData() }
                    )
                }
            }
        }
    }

    // Modal Dialogs
    if (uiState.showAddDialog) {
        AddMemoryDialog(
            albums = albums,
            onDismiss = { viewModel.setShowAddDialog(false) },
            onAddMemory = { url, title, desc, takenAt, tags, albumId, loc ->
                viewModel.addMemory(url, title, desc, takenAt, tags, albumId, loc)
            }
        )
    }

    if (uiState.selectedMemory != null) {
        MemoryDetailDialog(
            memory = uiState.selectedMemory!!,
            onDismiss = { viewModel.setSelectedMemory(null) },
            onToggleFavorite = { viewModel.toggleFavorite(uiState.selectedMemory!!) },
            onDelete = { viewModel.deleteMemory(uiState.selectedMemory!!.id) }
        )
    }

    if (uiState.showAuthDialog) {
        AuthDialog(
            currentUser = currentUser,
            allUsers = allUsers,
            onDismiss = { viewModel.setShowAuthDialog(false) },
            onSwitchOrLogin = { email, name ->
                viewModel.switchOrLoginUser(email, name)
            }
        )
    }

    if (uiState.showCreateAlbumDialog) {
        CreateAlbumDialog(
            onDismiss = { viewModel.setShowCreateAlbumDialog(false) },
            onCreateAlbum = { name, desc ->
                viewModel.createAlbum(name, desc)
            }
        )
    }
}

@Composable
fun MainTopBar(
    displayName: String,
    avatarInitial: String,
    onAvatarClick: () -> Unit,
    onSearchClick: () -> Unit
) {
    Surface(
        color = MemoryCream,
        modifier = Modifier
            .fillMaxWidth()
            .windowInsetsPadding(WindowInsets.statusBars)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            // Brand
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    modifier = Modifier.size(32.dp),
                    shape = CircleShape,
                    color = MemoryTerracotta
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            Icons.Filled.Favorite,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text = "MY MEMORIES",
                        style = MaterialTheme.typography.labelSmall.copy(
                            letterSpacing = 2.sp,
                            fontWeight = FontWeight.Bold
                        ),
                        color = MemoryInk
                    )
                    Text(
                        text = "Không gian của $displayName",
                        style = MaterialTheme.typography.bodySmall.copy(fontSize = 10.sp),
                        color = MemoryMuted
                    )
                }
            }

            // Actions (Search & Avatar)
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                IconButton(
                    onClick = onSearchClick,
                    modifier = Modifier.size(36.dp)
                ) {
                    Icon(
                        Icons.Filled.Search,
                        contentDescription = "Tìm kiếm",
                        tint = MemoryInk,
                        modifier = Modifier.size(20.dp)
                    )
                }

                Surface(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .clickable(onClick = onAvatarClick)
                        .testTag("user_avatar_button"),
                    color = Color(0xFFD4AB8A)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(
                            text = avatarInitial,
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun MainBottomNavBar(
    currentDestination: AppDestination,
    onNavigate: (AppDestination) -> Unit
) {
    NavigationBar(
        containerColor = Color(0xFFEEECE6),
        contentColor = MemoryInk,
        tonalElevation = 4.dp,
        modifier = Modifier
            .windowInsetsPadding(WindowInsets.navigationBars)
            .testTag("bottom_nav_bar")
    ) {
        val primaryNavItems = listOf(
            NAV_ITEMS[0], // Home
            NAV_ITEMS[1], // Media
            NAV_ITEMS[2], // Albums
            NAV_ITEMS[3], // Favorites
            NAV_ITEMS[5], // AI Search
            NAV_ITEMS[6]  // Settings
        )

        primaryNavItems.forEach { item ->
            val isSelected = currentDestination == item.destination
            NavigationBarItem(
                selected = isSelected,
                onClick = { onNavigate(item.destination) },
                icon = {
                    Icon(
                        imageVector = if (isSelected) item.selectedIcon else item.unselectedIcon,
                        contentDescription = item.title,
                        modifier = Modifier.size(20.dp)
                    )
                },
                label = {
                    Text(
                        text = item.title,
                        style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp),
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                    )
                },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = MemoryInk,
                    selectedTextColor = MemoryInk,
                    indicatorColor = Color(0xFFE4E1DA),
                    unselectedIconColor = Color(0xFF77746D),
                    unselectedTextColor = Color(0xFF77746D)
                )
            )
        }
    }
}
