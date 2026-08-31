package com.example.mymemories.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.outlined.AutoAwesome
import androidx.compose.material.icons.outlined.FilterList
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.mymemories.data.model.MemoryEntity
import com.example.mymemories.ui.components.PolaroidCard
import com.example.mymemories.ui.theme.MemoryCardCream
import com.example.mymemories.ui.theme.MemoryInk
import com.example.mymemories.ui.theme.MemoryLine
import com.example.mymemories.ui.theme.MemoryMuted
import com.example.mymemories.ui.theme.MemorySage
import com.example.mymemories.ui.theme.MemorySageLight
import com.example.mymemories.ui.theme.MemoryTerracotta
import com.example.mymemories.ui.viewmodel.AppDestination

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun HomeScreen(
    memories: List<MemoryEntity>,
    allTags: List<String>,
    selectedTag: String?,
    todayMemories: List<MemoryEntity>,
    onSelectTag: (String?) -> Unit,
    onMemoryClick: (MemoryEntity) -> Unit,
    onToggleFavorite: (MemoryEntity) -> Unit,
    onAddMemoryClick: () -> Unit,
    onNavigate: (AppDestination) -> Unit
) {
    LazyVerticalGrid(
        columns = GridCells.Adaptive(minSize = 160.dp),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(14.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        modifier = Modifier
            .fillMaxSize()
            .testTag("home_screen_grid")
    ) {
        // Hero Section (spans full width)
        item(span = { GridItemSpan(maxLineSpan) }) {
            HomeHeroSection(
                onAddMemoryClick = onAddMemoryClick
            )
        }

        // Feature Panels (Today's memories + AI Search prompt)
        item(span = { GridItemSpan(maxLineSpan) }) {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                // "Kỷ niệm hôm nay" panel
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onNavigate(AppDestination.TIMELINE) },
                    colors = CardDefaults.cardColors(containerColor = MemoryCardCream),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            modifier = Modifier.size(38.dp),
                            shape = CircleShape,
                            color = Color(0xFFDD9273)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(Icons.Filled.Favorite, contentDescription = null, tint = Color.White, modifier = Modifier.size(20.dp))
                            }
                        }
                        Spacer(modifier = Modifier.width(14.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text("KỶ NIỆM HÔM NAY", style = MaterialTheme.typography.labelSmall, color = MemoryTerracotta)
                            Text("Ngày này những năm trước", style = MaterialTheme.typography.titleMedium.copy(fontFamily = FontFamily.Serif, fontWeight = FontWeight.Medium), color = MemoryInk)
                            Text(
                                text = if (todayMemories.isNotEmpty()) "${todayMemories.size} khoảnh khắc đang chờ bạn mở lại." else "Lưu giữ khoảnh khắc để xem lại vào ngày này năm sau.",
                                style = MaterialTheme.typography.bodySmall,
                                color = Color(0xFF827B70)
                            )
                        }
                        Icon(Icons.Filled.ArrowForward, contentDescription = "Xem", tint = MemoryTerracotta, modifier = Modifier.size(18.dp))
                    }
                }

                // AI Smart search banner
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onNavigate(AppDestination.AI_SEARCH) },
                    colors = CardDefaults.cardColors(containerColor = MemorySageLight),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            modifier = Modifier.size(38.dp),
                            shape = CircleShape,
                            color = MemorySage
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(Icons.Outlined.AutoAwesome, contentDescription = null, tint = Color.White, modifier = Modifier.size(20.dp))
                            }
                        }
                        Spacer(modifier = Modifier.width(14.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text("TÌM KIẾM THÔNG MINH", style = MaterialTheme.typography.labelSmall, color = Color(0xFF3E7752))
                            Text("Hỏi về ký ức của bạn", style = MaterialTheme.typography.titleMedium.copy(fontFamily = FontFamily.Serif, fontWeight = FontWeight.Medium), color = MemoryInk)
                            Text("Thử tìm “Đà Lạt”, “hoàng hôn” hoặc “cà phê”.", style = MaterialTheme.typography.bodySmall, color = Color(0xFF5A7B68))
                        }
                        Icon(Icons.Filled.ArrowForward, contentDescription = "Tìm kiếm", tint = Color(0xFF3E7752), modifier = Modifier.size(18.dp))
                    }
                }
            }
        }

        // Section header + Tag filters
        item(span = { GridItemSpan(maxLineSpan) }) {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Bottom
                ) {
                    Column {
                        Text(
                            text = "THƯ VIỆN CỦA BẠN",
                            style = MaterialTheme.typography.labelSmall,
                            color = MemoryTerracotta
                        )
                        Text(
                            text = "Kỷ niệm gần đây",
                            style = MaterialTheme.typography.headlineMedium,
                            color = MemoryInk
                        )
                    }

                    Text(
                        text = "${memories.size} khoảnh khắc",
                        style = MaterialTheme.typography.bodySmall,
                        color = MemoryMuted
                    )
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

                        allTags.take(6).forEach { tag ->
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

        // Memories Grid items
        if (memories.isEmpty()) {
            item(span = { GridItemSpan(maxLineSpan) }) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 24.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.Transparent),
                    border = androidx.compose.foundation.BorderStroke(1.dp, MemoryLine),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Chưa có dữ liệu phù hợp.",
                            style = MaterialTheme.typography.bodyLarge,
                            color = MemoryMuted
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(
                            onClick = onAddMemoryClick,
                            colors = ButtonDefaults.buttonColors(containerColor = MemoryInk)
                        ) {
                            Icon(Icons.Filled.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Thêm kỷ niệm đầu tiên")
                        }
                    }
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

@Composable
fun HomeHeroSection(
    onAddMemoryClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFF3EFE8)),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier.padding(20.dp)
        ) {
            Text(
                text = "KHOẢNH KHẮC CỦA RIÊNG BẠN",
                style = MaterialTheme.typography.labelSmall,
                color = MemoryTerracotta
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Những điều\nđáng nhớ.",
                style = MaterialTheme.typography.displayLarge.copy(
                    lineHeight = 44.sp,
                    fontWeight = FontWeight.Medium
                ),
                color = MemoryInk
            )

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "Lưu giữ những khoảnh khắc quan trọng và tìm lại chúng theo cách thật tự nhiên.",
                style = MaterialTheme.typography.bodyMedium,
                color = MemoryMuted,
                lineHeight = 20.sp
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Art preview with styled Polaroid cards
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(140.dp),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Back card tilted
                Surface(
                    modifier = Modifier
                        .width(115.dp)
                        .rotate(-6f)
                        .shadow(elevation = 6.dp, shape = RoundedCornerShape(4.dp)),
                    color = Color.White,
                    shape = RoundedCornerShape(4.dp)
                ) {
                    Column(modifier = Modifier.padding(6.dp)) {
                        AsyncImage(
                            model = "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
                            contentDescription = null,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(85.dp)
                                .clip(RoundedCornerShape(2.dp)),
                            contentScale = ContentScale.Crop
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("kỷ niệm cũ", fontSize = 9.sp, fontFamily = FontFamily.Serif, color = MemoryMuted)
                    }
                }

                Spacer(modifier = Modifier.width(12.dp))

                // Front card tilted
                Surface(
                    modifier = Modifier
                        .width(125.dp)
                        .rotate(5f)
                        .shadow(elevation = 10.dp, shape = RoundedCornerShape(4.dp)),
                    color = Color.White,
                    shape = RoundedCornerShape(4.dp)
                ) {
                    Column(modifier = Modifier.padding(7.dp)) {
                        AsyncImage(
                            model = "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=400&q=80",
                            contentDescription = null,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(95.dp)
                                .clip(RoundedCornerShape(2.dp)),
                            contentScale = ContentScale.Crop
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("một ngày rất đẹp", fontSize = 10.sp, fontFamily = FontFamily.Serif, color = MemoryInk)
                    }
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            Button(
                onClick = onAddMemoryClick,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MemoryInk,
                    contentColor = Color.White
                ),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(46.dp)
                    .testTag("hero_add_memory_button")
            ) {
                Icon(Icons.Filled.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Thêm kỷ niệm", fontWeight = FontWeight.SemiBold)
            }
        }
    }
}
