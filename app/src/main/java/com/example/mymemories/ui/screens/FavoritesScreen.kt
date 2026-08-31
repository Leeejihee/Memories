package com.example.mymemories.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
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

@Composable
fun FavoritesScreen(
    memories: List<MemoryEntity>,
    onMemoryClick: (MemoryEntity) -> Unit,
    onToggleFavorite: (MemoryEntity) -> Unit
) {
    val favoriteList = memories.filter { it.isFavorite }

    LazyVerticalGrid(
        columns = GridCells.Adaptive(minSize = 150.dp),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(14.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        modifier = Modifier
            .fillMaxSize()
            .testTag("favorites_screen_grid")
    ) {
        item(span = { GridItemSpan(maxLineSpan) }) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Bottom
            ) {
                Column {
                    Text(
                        text = "ĐƯỢC YÊU THÍCH",
                        style = MaterialTheme.typography.labelSmall,
                        color = MemoryTerracotta
                    )
                    Text(
                        text = "Khoảnh khắc quý giá",
                        style = MaterialTheme.typography.headlineMedium,
                        color = MemoryInk
                    )
                }

                Text(
                    text = "${favoriteList.size} yêu thích",
                    style = MaterialTheme.typography.bodySmall,
                    color = MemoryMuted
                )
            }
        }

        if (favoriteList.isEmpty()) {
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
                        text = "Chưa có kỷ niệm nào được đánh dấu yêu thích.\nNhấn vào biểu tượng trái tim trên bất kỳ ảnh nào để ghim vào đây.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MemoryMuted,
                        modifier = Modifier.padding(32.dp),
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                }
            }
        } else {
            items(favoriteList, key = { it.id }) { memory ->
                PolaroidCard(
                    memory = memory,
                    onClick = { onMemoryClick(memory) },
                    onToggleFavorite = { onToggleFavorite(memory) }
                )
            }
        }

        item(span = { GridItemSpan(maxLineSpan) }) {
            Spacer(modifier = Modifier.height(30.dp))
        }
    }
}
