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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.Collections
import androidx.compose.material.icons.outlined.Image
import androidx.compose.material.icons.outlined.Label
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.mymemories.data.model.AlbumEntity
import com.example.mymemories.data.model.MemoryEntity
import com.example.mymemories.data.model.UserAccountEntity
import com.example.mymemories.ui.theme.MemoryCardCream
import com.example.mymemories.ui.theme.MemoryCream
import com.example.mymemories.ui.theme.MemoryInk
import com.example.mymemories.ui.theme.MemoryLine
import com.example.mymemories.ui.theme.MemoryMuted
import com.example.mymemories.ui.theme.MemorySage
import com.example.mymemories.ui.theme.MemorySageLight
import com.example.mymemories.ui.theme.MemoryTerracotta

@Composable
fun SettingsScreen(
    currentUser: UserAccountEntity?,
    memories: List<MemoryEntity>,
    albums: List<AlbumEntity>,
    onOpenAuthDialog: () -> Unit,
    onResetDemoData: () -> Unit
) {
    val totalFavorites = memories.count { it.isFavorite }
    val totalTags = memories.flatMap { it.aiTags }.distinct().size

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
            .testTag("settings_screen"),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Column {
            Text(
                text = "TÙY CHỈNH & HỒ SƠ",
                style = MaterialTheme.typography.labelSmall,
                color = MemoryTerracotta
            )
            Text(
                text = "Cài đặt không gian",
                style = MaterialTheme.typography.headlineMedium,
                color = MemoryInk
            )
        }

        // User profile card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            shape = RoundedCornerShape(10.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, MemoryLine)
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        modifier = Modifier.size(48.dp),
                        shape = CircleShape,
                        color = Color(0xFFD4AB8A)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(
                                text = currentUser?.avatarInitial ?: "K",
                                color = Color.White,
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                    Spacer(modifier = Modifier.width(14.dp))
                    Column {
                        Text(
                            text = "Không gian của",
                            style = MaterialTheme.typography.bodySmall,
                            color = MemoryMuted
                        )
                        Text(
                            text = currentUser?.displayName ?: "khách",
                            style = MaterialTheme.typography.titleLarge.copy(fontFamily = FontFamily.Serif),
                            color = MemoryInk
                        )
                        Text(
                            text = currentUser?.email ?: "guest@mymemories.app",
                            style = MaterialTheme.typography.bodySmall,
                            color = MemoryMuted
                        )
                    }
                }

                Button(
                    onClick = onOpenAuthDialog,
                    colors = ButtonDefaults.buttonColors(containerColor = MemoryInk),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text("Đổi / Đăng nhập", fontSize = 11.sp)
                }
            }
        }

        // Privacy & Account Isolation Note
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MemorySageLight),
            shape = RoundedCornerShape(10.dp)
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    modifier = Modifier.size(36.dp),
                    shape = CircleShape,
                    color = MemorySage
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(Icons.Filled.Check, contentDescription = null, tint = Color.White, modifier = Modifier.size(20.dp))
                    }
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "Dữ liệu riêng tư & Cách ly an toàn",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                        color = Color(0xFF2C553C)
                    )
                    Text(
                        text = "Chỉ mình bạn có thể xem và quản lý các kỷ niệm trong không gian này.",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color(0xFF4C755B)
                    )
                }
            }
        }

        // Stats Grid
        Text(
            text = "THỐNG KÊ THƯ VIỆN",
            style = MaterialTheme.typography.labelSmall,
            color = MemoryTerracotta
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Memories stat
            StatCard(
                title = "Khoảnh khắc",
                count = "${memories.size}",
                icon = { Icon(Icons.Outlined.Image, contentDescription = null, tint = MemoryTerracotta) },
                modifier = Modifier.weight(1f)
            )

            // Albums stat
            StatCard(
                title = "Albums",
                count = "${albums.size}",
                icon = { Icon(Icons.Outlined.Collections, contentDescription = null, tint = Color(0xFF5A7B68)) },
                modifier = Modifier.weight(1f)
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Favorites stat
            StatCard(
                title = "Yêu thích",
                count = "$totalFavorites",
                icon = { Icon(Icons.Filled.Favorite, contentDescription = null, tint = MemoryTerracotta) },
                modifier = Modifier.weight(1f)
            )

            // Tags stat
            StatCard(
                title = "Thẻ chủ đề",
                count = "$totalTags",
                icon = { Icon(Icons.Outlined.Label, contentDescription = null, tint = Color(0xFF3B6E8C)) },
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Reload demo data button
        OutlinedButton(
            onClick = onResetDemoData,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(8.dp),
            colors = androidx.compose.material3.ButtonDefaults.outlinedButtonColors(contentColor = MemoryInk)
        ) {
            Icon(Icons.Filled.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text("Tải lại dữ liệu mẫu (Đà Lạt, Hội An, ...)")
        }

        // About card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            shape = RoundedCornerShape(8.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, MemoryLine)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("My Memories v1.0", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    "Ứng dụng nhật ký hình ảnh và lưu giữ kỷ niệm cá nhân với phong cách Polaroid ấm áp.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MemoryMuted
                )
            }
        }

        Spacer(modifier = Modifier.height(30.dp))
    }
}

@Composable
private fun StatCard(
    title: String,
    count: String,
    icon: @Composable () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(8.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, MemoryLine)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(title, style = MaterialTheme.typography.bodySmall, color = MemoryMuted)
                icon()
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = count,
                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
                color = MemoryInk
            )
        }
    }
}
