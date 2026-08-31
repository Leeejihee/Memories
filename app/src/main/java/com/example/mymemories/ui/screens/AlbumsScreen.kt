package com.example.mymemories.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.outlined.Collections
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.mymemories.data.model.AlbumEntity
import com.example.mymemories.data.model.MemoryEntity
import com.example.mymemories.ui.components.PolaroidCard
import com.example.mymemories.ui.theme.MemoryCardCream
import com.example.mymemories.ui.theme.MemoryInk
import com.example.mymemories.ui.theme.MemoryLine
import com.example.mymemories.ui.theme.MemoryMuted
import com.example.mymemories.ui.theme.MemoryTerracotta

@Composable
fun AlbumsScreen(
    albums: List<AlbumEntity>,
    allMemories: List<MemoryEntity>,
    selectedAlbumId: String?,
    onSelectAlbum: (String?) -> Unit,
    onCreateAlbumClick: () -> Unit,
    onDeleteAlbum: (AlbumEntity) -> Unit,
    onMemoryClick: (MemoryEntity) -> Unit,
    onToggleFavorite: (MemoryEntity) -> Unit
) {
    val selectedAlbum = albums.find { it.id == selectedAlbumId }

    if (selectedAlbum != null) {
        // Detailed album view
        val albumMemories = allMemories.filter { it.albumId == selectedAlbum.id }

        LazyVerticalGrid(
            columns = GridCells.Adaptive(minSize = 150.dp),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            item(span = { GridItemSpan(maxLineSpan) }) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(onClick = { onSelectAlbum(null) }) {
                                Icon(Icons.Filled.ArrowBack, contentDescription = "Quay lại", tint = MemoryInk)
                            }
                            Spacer(modifier = Modifier.width(4.dp))
                            Column {
                                Text(
                                    text = "ALBUM",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MemoryTerracotta
                                )
                                Text(
                                    text = selectedAlbum.name,
                                    style = MaterialTheme.typography.headlineMedium,
                                    color = MemoryInk
                                )
                            }
                        }

                        IconButton(onClick = { onDeleteAlbum(selectedAlbum) }) {
                            Icon(Icons.Filled.Delete, contentDescription = "Xóa album", tint = Color(0xFFA6442E))
                        }
                    }

                    if (!selectedAlbum.description.isNullOrBlank()) {
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = selectedAlbum.description,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MemoryMuted,
                            modifier = Modifier.padding(start = 8.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "${albumMemories.size} khoảnh khắc trong album này",
                        style = MaterialTheme.typography.bodySmall,
                        color = MemoryMuted,
                        modifier = Modifier.padding(start = 8.dp)
                    )
                }
            }

            if (albumMemories.isEmpty()) {
                item(span = { GridItemSpan(maxLineSpan) }) {
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 32.dp),
                        shape = RoundedCornerShape(8.dp),
                        color = Color.White,
                        border = androidx.compose.foundation.BorderStroke(1.dp, MemoryLine)
                    ) {
                        Text(
                            text = "Chưa có kỷ niệm nào trong album này.\nHãy thêm kỷ niệm mới và chọn album này khi lưu.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MemoryMuted,
                            modifier = Modifier.padding(32.dp),
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                    }
                }
            } else {
                items(albumMemories, key = { it.id }) { memory ->
                    PolaroidCard(
                        memory = memory,
                        onClick = { onMemoryClick(memory) },
                        onToggleFavorite = { onToggleFavorite(memory) }
                    )
                }
            }
        }
    } else {
        // All albums list view
        LazyVerticalGrid(
            columns = GridCells.Adaptive(minSize = 160.dp),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier
                .fillMaxSize()
                .testTag("albums_screen_grid")
        ) {
            item(span = { GridItemSpan(maxLineSpan) }) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "BỘ SƯU TẬP",
                            style = MaterialTheme.typography.labelSmall,
                            color = MemoryTerracotta
                        )
                        Text(
                            text = "Album kỷ niệm",
                            style = MaterialTheme.typography.headlineMedium,
                            color = MemoryInk
                        )
                    }

                    Button(
                        onClick = onCreateAlbumClick,
                        colors = ButtonDefaults.buttonColors(containerColor = MemoryInk),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.testTag("create_album_button")
                    ) {
                        Icon(Icons.Filled.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Tạo album", fontSize = 12.sp)
                    }
                }
            }

            items(albums, key = { it.id }) { album ->
                val albumMemories = allMemories.filter { it.albumId == album.id }
                val coverImage = albumMemories.firstOrNull()?.storageKey

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(elevation = 6.dp, shape = RoundedCornerShape(8.dp), ambientColor = Color(0x2065523B))
                        .clickable { onSelectAlbum(album.id) }
                        .testTag("album_card_${album.id}"),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Column {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .aspectRatio(1.2f)
                                .background(MemoryCardCream)
                        ) {
                            if (coverImage != null) {
                                AsyncImage(
                                    model = coverImage,
                                    contentDescription = album.name,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.fillMaxSize()
                                )
                            } else {
                                Box(
                                    modifier = Modifier.fillMaxSize(),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        Icons.Outlined.Collections,
                                        contentDescription = null,
                                        tint = MemoryMuted,
                                        modifier = Modifier.size(36.dp)
                                    )
                                }
                            }
                        }

                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(
                                text = album.name,
                                style = MaterialTheme.typography.titleMedium.copy(
                                    fontFamily = FontFamily.Serif,
                                    fontWeight = FontWeight.SemiBold
                                ),
                                color = MemoryInk,
                                maxLines = 1
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "${albumMemories.size} khoảnh khắc",
                                style = MaterialTheme.typography.bodySmall,
                                color = MemoryMuted
                            )
                        }
                    }
                }
            }

            item(span = { GridItemSpan(maxLineSpan) }) {
                Spacer(modifier = Modifier.height(30.dp))
            }
        }
    }
}
