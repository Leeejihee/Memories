package com.example.mymemories.ui.screens

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.Place
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
import com.example.mymemories.data.model.MemoryEntity
import com.example.mymemories.ui.theme.MemoryCardCream
import com.example.mymemories.ui.theme.MemoryCream
import com.example.mymemories.ui.theme.MemoryInk
import com.example.mymemories.ui.theme.MemoryLine
import com.example.mymemories.ui.theme.MemoryMuted
import com.example.mymemories.ui.theme.MemoryTerracotta

@Composable
fun TimelineScreen(
    memories: List<MemoryEntity>,
    onMemoryClick: (MemoryEntity) -> Unit,
    onToggleFavorite: (MemoryEntity) -> Unit
) {
    val sortedMemories = memories.sortedByDescending { it.takenAt ?: "0000-00-00" }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .testTag("timeline_screen_list"),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(12.dp))
            Column {
                Text(
                    text = "DÒNG THỜI GIAN",
                    style = MaterialTheme.typography.labelSmall,
                    color = MemoryTerracotta
                )
                Text(
                    text = "Ký ức theo năm tháng",
                    style = MaterialTheme.typography.headlineMedium,
                    color = MemoryInk
                )
                Text(
                    text = "Hành trình và những khoảnh khắc được sắp xếp theo thời gian.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MemoryMuted
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
        }

        if (sortedMemories.isEmpty()) {
            item {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 32.dp),
                    shape = RoundedCornerShape(8.dp),
                    color = Color.White,
                    border = androidx.compose.foundation.BorderStroke(1.dp, MemoryLine)
                ) {
                    Text(
                        text = "Chưa có kỷ niệm nào trên dòng thời gian.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MemoryMuted,
                        modifier = Modifier.padding(32.dp),
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                }
            }
        } else {
            items(sortedMemories, key = { it.id }) { memory ->
                Row(modifier = Modifier.fillMaxWidth()) {
                    // Timeline Node Column
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.width(32.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(14.dp)
                                .clip(CircleShape)
                                .background(MemoryTerracotta)
                        )
                        Box(
                            modifier = Modifier
                                .width(2.dp)
                                .height(160.dp)
                                .background(MemoryLine)
                        )
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    // Memory Card
                    Card(
                        modifier = Modifier
                            .weight(1f)
                            .shadow(elevation = 4.dp, shape = RoundedCornerShape(8.dp), ambientColor = Color(0x2065523B))
                            .clickable { onMemoryClick(memory) },
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Column {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(140.dp)
                                    .background(MemoryCardCream)
                            ) {
                                AsyncImage(
                                    model = memory.storageKey,
                                    contentDescription = memory.title ?: memory.fileName,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.fillMaxSize()
                                )

                                Surface(
                                    modifier = Modifier
                                        .align(Alignment.TopEnd)
                                        .padding(8.dp)
                                        .size(30.dp),
                                    shape = CircleShape,
                                    color = Color.White.copy(alpha = 0.85f)
                                ) {
                                    IconButton(onClick = { onToggleFavorite(memory) }) {
                                        Icon(
                                            imageVector = if (memory.isFavorite) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                                            contentDescription = "Yêu thích",
                                            tint = if (memory.isFavorite) MemoryTerracotta else MemoryMuted,
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                }
                            }

                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(
                                    text = memory.title ?: memory.fileName,
                                    style = MaterialTheme.typography.titleMedium.copy(
                                        fontFamily = FontFamily.Serif,
                                        fontWeight = FontWeight.SemiBold
                                    ),
                                    color = MemoryInk
                                )

                                Spacer(modifier = Modifier.height(4.dp))

                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        Icons.Filled.CalendarMonth,
                                        contentDescription = null,
                                        tint = MemoryTerracotta,
                                        modifier = Modifier.size(14.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = memory.takenAt ?: "Chưa rõ ngày",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MemoryInk,
                                        fontWeight = FontWeight.Medium
                                    )

                                    if (!memory.location.isNullOrBlank()) {
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Icon(
                                            Icons.Outlined.Place,
                                            contentDescription = null,
                                            tint = MemoryMuted,
                                            modifier = Modifier.size(14.dp)
                                        )
                                        Spacer(modifier = Modifier.width(2.dp))
                                        Text(
                                            text = memory.location,
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MemoryMuted
                                        )
                                    }
                                }

                                if (!memory.description.isNullOrBlank()) {
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(
                                        text = memory.description,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MemoryMuted,
                                        maxLines = 2
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(30.dp))
        }
    }
}
