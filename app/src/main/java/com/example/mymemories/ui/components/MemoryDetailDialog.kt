package com.example.mymemories.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.outlined.DateRange
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.Place
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import coil.compose.SubcomposeAsyncImage
import coil.request.ImageRequest
import com.example.mymemories.data.model.MemoryEntity
import com.example.mymemories.ui.theme.MemoryCardCream
import com.example.mymemories.ui.theme.MemoryCream
import com.example.mymemories.ui.theme.MemoryInk
import com.example.mymemories.ui.theme.MemoryLine
import com.example.mymemories.ui.theme.MemoryMuted
import com.example.mymemories.ui.theme.MemoryPeach
import com.example.mymemories.ui.theme.MemoryTerracotta

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun MemoryDetailDialog(
    memory: MemoryEntity,
    onDismiss: () -> Unit,
    onToggleFavorite: () -> Unit,
    onDelete: () -> Unit
) {
    var showConfirmDelete by remember { mutableStateOf(false) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp)),
            color = MemoryCream,
            shadowElevation = 24.dp
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
            ) {
                // Image Header with close and favorite buttons
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(1.2f)
                        .background(Color(0xFFE8E4DC))
                ) {
                    SubcomposeAsyncImage(
                        model = ImageRequest.Builder(LocalContext.current)
                            .data(memory.storageKey)
                            .crossfade(true)
                            .build(),
                        contentDescription = memory.title ?: memory.fileName,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize(),
                        loading = {
                            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                CircularProgressIndicator(color = MemoryTerracotta)
                            }
                        }
                    )

                    // Close button
                    Surface(
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .padding(12.dp)
                            .size(36.dp),
                        shape = CircleShape,
                        color = Color.Black.copy(alpha = 0.5f)
                    ) {
                        IconButton(onClick = onDismiss) {
                            Icon(Icons.Filled.Close, contentDescription = "Đóng", tint = Color.White)
                        }
                    }

                    // Favorite button
                    Surface(
                        modifier = Modifier
                            .align(Alignment.BottomEnd)
                            .padding(12.dp)
                            .size(42.dp),
                        shape = CircleShape,
                        color = Color.White,
                        shadowElevation = 4.dp
                    ) {
                        IconButton(
                            onClick = onToggleFavorite,
                            modifier = Modifier.testTag("detail_favorite_button")
                        ) {
                            Icon(
                                imageVector = if (memory.isFavorite) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                                contentDescription = "Yêu thích",
                                tint = if (memory.isFavorite) MemoryTerracotta else MemoryMuted,
                                modifier = Modifier.size(22.dp)
                            )
                        }
                    }
                }

                // Info Section
                Column(
                    modifier = Modifier.padding(20.dp)
                ) {
                    Text(
                        text = "KHOẢNH KHẮC",
                        style = MaterialTheme.typography.labelSmall,
                        color = MemoryTerracotta
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = memory.title ?: memory.fileName,
                        style = MaterialTheme.typography.displaySmall.copy(
                            fontFamily = FontFamily.Serif,
                            fontWeight = FontWeight.Medium
                        ),
                        color = MemoryInk
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    // Date and Location row
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        if (!memory.takenAt.isNullOrBlank()) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    Icons.Outlined.DateRange,
                                    contentDescription = null,
                                    tint = MemoryMuted,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = memory.takenAt,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MemoryMuted
                                )
                            }
                        }

                        if (!memory.location.isNullOrBlank()) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    Icons.Outlined.Place,
                                    contentDescription = null,
                                    tint = MemoryMuted,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = memory.location,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MemoryMuted
                                )
                            }
                        }
                    }

                    if (!memory.description.isNullOrBlank()) {
                        Spacer(modifier = Modifier.height(16.dp))
                        Surface(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(8.dp),
                            color = MemoryCardCream
                        ) {
                            Text(
                                text = memory.description,
                                style = MaterialTheme.typography.bodyLarge,
                                color = MemoryInk,
                                modifier = Modifier.padding(14.dp)
                            )
                        }
                    }

                    if (memory.aiTags.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "Thẻ cảm xúc & chủ đề:",
                            style = MaterialTheme.typography.labelSmall,
                            color = MemoryMuted
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        FlowRow(
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            verticalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            memory.aiTags.forEach { tag ->
                                Surface(
                                    shape = RoundedCornerShape(16.dp),
                                    color = Color.White,
                                    border = androidx.compose.foundation.BorderStroke(1.dp, MemoryLine)
                                ) {
                                    Text(
                                        text = "#$tag",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MemoryInk,
                                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // Delete button
                    if (!showConfirmDelete) {
                        OutlinedButton(
                            onClick = { showConfirmDelete = true },
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("delete_memory_button"),
                            shape = RoundedCornerShape(8.dp),
                            colors = androidx.compose.material3.ButtonDefaults.outlinedButtonColors(
                                contentColor = Color(0xFFA6442E)
                            )
                        ) {
                            Icon(Icons.Filled.Delete, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Xóa kỷ niệm này")
                        }
                    } else {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(MemoryPeach, RoundedCornerShape(8.dp))
                                .padding(12.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "Bạn có chắc muốn xóa kỷ niệm này khỏi thư viện?",
                                style = MaterialTheme.typography.bodySmall,
                                color = Color(0xFFA6442E),
                                fontWeight = FontWeight.SemiBold
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                OutlinedButton(
                                    onClick = { showConfirmDelete = false },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(6.dp)
                                ) {
                                    Text("Hủy")
                                }
                                androidx.compose.material3.Button(
                                    onClick = onDelete,
                                    modifier = Modifier
                                        .weight(1f)
                                        .testTag("confirm_delete_button"),
                                    shape = RoundedCornerShape(6.dp),
                                    colors = androidx.compose.material3.ButtonDefaults.buttonColors(
                                        containerColor = Color(0xFFA6442E),
                                        contentColor = Color.White
                                    )
                                ) {
                                    Text("Xác nhận xóa")
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
