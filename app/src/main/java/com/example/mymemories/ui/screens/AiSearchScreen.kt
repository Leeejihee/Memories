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
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.outlined.AutoAwesome
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.mymemories.data.model.MemoryEntity
import com.example.mymemories.ui.components.PolaroidCard
import com.example.mymemories.ui.theme.MemoryInk
import com.example.mymemories.ui.theme.MemoryLine
import com.example.mymemories.ui.theme.MemoryMuted
import com.example.mymemories.ui.theme.MemorySage
import com.example.mymemories.ui.theme.MemorySageLight
import com.example.mymemories.ui.theme.MemoryTerracotta

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun AiSearchScreen(
    searchQuery: String,
    memories: List<MemoryEntity>,
    allTags: List<String>,
    onQueryChange: (String) -> Unit,
    onMemoryClick: (MemoryEntity) -> Unit,
    onToggleFavorite: (MemoryEntity) -> Unit
) {
    val quickPrompts = listOf(
        "Đà Lạt",
        "Hoàng hôn",
        "Cà phê",
        "Bạn bè",
        "Biển",
        "Hội An",
        "Sương sớm",
        "Yên bình"
    )

    LazyVerticalGrid(
        columns = GridCells.Adaptive(minSize = 150.dp),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(14.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        modifier = Modifier
            .fillMaxSize()
            .testTag("ai_search_screen_grid")
    ) {
        item(span = { GridItemSpan(maxLineSpan) }) {
            Column {
                Text(
                    text = "TÌM KIẾM THÔNG MINH",
                    style = MaterialTheme.typography.labelSmall,
                    color = Color(0xFF3E7752)
                )
                Text(
                    text = "Tìm lại theo cảm xúc",
                    style = MaterialTheme.typography.headlineMedium,
                    color = MemoryInk
                )
                Text(
                    text = "Tìm kiếm theo từ khóa, địa điểm, chủ đề hoặc thẻ cảm xúc trong từng bức ảnh.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MemoryMuted
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Search Input Box
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = onQueryChange,
                    placeholder = { Text("Thử tìm “Đà Lạt”, “hoàng hôn”, “cà phê”...") },
                    leadingIcon = {
                        Icon(Icons.Outlined.AutoAwesome, contentDescription = null, tint = MemorySage)
                    },
                    trailingIcon = {
                        if (searchQuery.isNotBlank()) {
                            IconButton(onClick = { onQueryChange("") }) {
                                Icon(Icons.Filled.Clear, contentDescription = "Xóa tìm kiếm", tint = MemoryMuted)
                            }
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("ai_search_input"),
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MemorySage,
                        unfocusedBorderColor = MemoryLine,
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    ),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = "Gợi ý tìm kiếm phổ biến:",
                    style = MaterialTheme.typography.labelSmall,
                    color = MemoryMuted
                )

                Spacer(modifier = Modifier.height(8.dp))

                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    quickPrompts.forEach { prompt ->
                        val isCurrent = searchQuery.equals(prompt, ignoreCase = true)
                        Surface(
                            shape = RoundedCornerShape(16.dp),
                            color = if (isCurrent) MemorySage else MemorySageLight,
                            modifier = Modifier.clickable { onQueryChange(prompt) }
                        ) {
                            Text(
                                text = "✨ $prompt",
                                style = MaterialTheme.typography.labelSmall,
                                color = if (isCurrent) Color.White else Color(0xFF2C553C),
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (searchQuery.isBlank()) "Tất cả kỷ niệm" else "Kết quả cho “$searchQuery”",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontFamily = FontFamily.Serif,
                            fontWeight = FontWeight.SemiBold
                        ),
                        color = MemoryInk
                    )

                    Text(
                        text = "${memories.size} kết quả",
                        style = MaterialTheme.typography.bodySmall,
                        color = MemoryMuted
                    )
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
                        text = "Không tìm thấy kỷ niệm nào phù hợp với “$searchQuery”.\nHãy thử từ khóa khác như tên địa điểm hoặc chủ đề ảnh.",
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
                    onToggleFavorite = { onToggleFavorite(memory) }
                )
            }
        }

        item(span = { GridItemSpan(maxLineSpan) }) {
            Spacer(modifier = Modifier.height(30.dp))
        }
    }
}
