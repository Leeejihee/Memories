package com.example.mymemories.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.ViewAgenda
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import com.example.mymemories.data.model.MemoryEntity
import com.example.mymemories.ui.components.PolaroidCard
import com.example.mymemories.ui.theme.MemoryInk
import com.example.mymemories.ui.theme.MemoryLine
import com.example.mymemories.ui.theme.MemoryMuted
import com.example.mymemories.ui.theme.MemoryTerracotta

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun MediaScreen(
    memories: List<MemoryEntity>,
    allTags: List<String>,
    selectedTag: String?,
    isGridView: Boolean,
    onToggleView: () -> Unit,
    onSelectTag: (String?) -> Unit,
    onMemoryClick: (MemoryEntity) -> Unit,
    onToggleFavorite: (MemoryEntity) -> Unit
) {
    val columns = if (isGridView) GridCells.Adaptive(minSize = 150.dp) else GridCells.Fixed(1)

    LazyVerticalGrid(
        columns = columns,
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(14.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        modifier = Modifier
            .fillMaxSize()
            .testTag("media_screen_grid")
    ) {
        // Section Header
        item(span = { GridItemSpan(maxLineSpan) }) {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "THƯ VIỆN HÌNH ẢNH",
                            style = MaterialTheme.typography.labelSmall,
                            color = MemoryTerracotta
                        )
                        Text(
                            text = "Tất cả ảnh & video",
                            style = MaterialTheme.typography.headlineMedium,
                            color = MemoryInk
                        )
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "${memories.size} mục",
                            style = MaterialTheme.typography.bodySmall,
                            color = MemoryMuted,
                            modifier = Modifier.padding(end = 6.dp)
                        )
                        IconButton(onClick = onToggleView) {
                            Icon(
                                imageVector = if (isGridView) Icons.Filled.ViewAgenda else Icons.Filled.GridView,
                                contentDescription = "Đổi chế độ xem",
                                tint = MemoryInk,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }

                if (allTags.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(10.dp))
                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Surface(
                            shape = RoundedCornerShape(16.dp),
                            color = if (selectedTag == null) MemoryInk else Color.White,
                            border = androidx.compose.foundation.BorderStroke(1.dp, if (selectedTag == null) MemoryInk else MemoryLine),
                            modifier = Modifier.clickable { onSelectTag(null) }
                        ) {
                            Text(
                                text = "Tất cả",
                                style = MaterialTheme.typography.labelSmall,
                                color = if (selectedTag == null) Color.White else MemoryInk,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                            )
                        }

                        allTags.forEach { tag ->
                            val isSelected = selectedTag == tag
                            Surface(
                                shape = RoundedCornerShape(16.dp),
                                color = if (isSelected) MemoryTerracotta else Color.White,
                                border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) MemoryTerracotta else MemoryLine),
                                modifier = Modifier.clickable { onSelectTag(tag) }
                            ) {
                                Text(
                                    text = "#$tag",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = if (isSelected) Color.White else MemoryInk,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                                )
                            }
                        }
                    }
                }
            }
        }

        if (memories.isEmpty()) {
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
                        text = "Không tìm thấy kỷ niệm nào theo bộ lọc này.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MemoryMuted,
                        modifier = Modifier.padding(32.dp),
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                }
            }
        } else {
            items(memories, key = { it.id }) { memory ->
                PolaroidCard(
                    memory = memory,
                    onClick = { onMemoryClick(memory) },
                    onToggleFavorite = { onToggleFavorite(memory) },
                    aspectRatio = if (isGridView) 1f else 1.3f
                )
            }
        }

        item(span = { GridItemSpan(maxLineSpan) }) {
            Spacer(modifier = Modifier.height(30.dp))
        }
    }
}
