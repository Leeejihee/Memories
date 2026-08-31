package com.example.mymemories.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
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
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.outlined.Collections
import androidx.compose.material.icons.outlined.DateRange
import androidx.compose.material.icons.outlined.Label
import androidx.compose.material.icons.outlined.Link
import androidx.compose.material.icons.outlined.Place
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextFieldDefaults
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
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.example.mymemories.data.model.AlbumEntity
import com.example.mymemories.ui.theme.MemoryCardCream
import com.example.mymemories.ui.theme.MemoryCream
import com.example.mymemories.ui.theme.MemoryInk
import com.example.mymemories.ui.theme.MemoryLine
import com.example.mymemories.ui.theme.MemoryMuted
import com.example.mymemories.ui.theme.MemoryTerracotta
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class ImagePreset(
    val title: String,
    val url: String,
    val defaultTags: List<String>,
    val defaultLocation: String
)

val PRESET_IMAGES = listOf(
    ImagePreset(
        title = "Hoàng hôn trên sông Hương",
        url = "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=85",
        defaultTags = listOf("Huế", "hoàng hôn", "sông nước"),
        defaultLocation = "Huế"
    ),
    ImagePreset(
        title = "Góc ban công ngập nắng",
        url = "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=900&q=85",
        defaultTags = listOf("nắng", "cây xanh", "bình yên"),
        defaultLocation = "Sài Gòn"
    ),
    ImagePreset(
        title = "Chuyến tàu qua đèo Hải Vân",
        url = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=85",
        defaultTags = listOf("du lịch", "núi biển", "hải vân"),
        defaultLocation = "Đà Nẵng"
    ),
    ImagePreset(
        title = "Mùa thu Hà Nội",
        url = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85",
        defaultTags = listOf("mùa thu", "hoa sữa", "phố cổ"),
        defaultLocation = "Hà Nội"
    )
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddMemoryDialog(
    albums: List<AlbumEntity>,
    onDismiss: () -> Unit,
    onAddMemory: (url: String, title: String, description: String?, takenAt: String?, tags: List<String>, albumId: String?, location: String?) -> Unit
) {
    var url by remember { mutableStateOf("") }
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var location by remember { mutableStateOf("") }
    var takenAt by remember { mutableStateOf(SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())) }
    var tagInput by remember { mutableStateOf("") }
    var selectedAlbumId by remember { mutableStateOf<String?>(null) }
    var albumDropdownExpanded by remember { mutableStateOf(false) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .padding(20.dp)
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp)),
            color = MemoryCream,
            shadowElevation = 16.dp
        ) {
            Column(
                modifier = Modifier
                    .padding(24.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "THÊM NGUỒN KỶ NIỆM",
                            style = MaterialTheme.typography.labelSmall,
                            color = MemoryTerracotta
                        )
                        Text(
                            text = "Đưa một khoảnh khắc\nvào không gian riêng.",
                            style = MaterialTheme.typography.displaySmall.copy(
                                fontFamily = FontFamily.Serif,
                                fontWeight = FontWeight.Medium,
                                lineHeight = 28.sp
                            ),
                            color = MemoryInk
                        )
                    }

                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier.testTag("close_add_dialog")
                    ) {
                        Icon(Icons.Filled.Close, contentDescription = "Đóng", tint = MemoryMuted)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Presets carousel
                Text(
                    text = "Gợi ý hình ảnh nhanh:",
                    style = MaterialTheme.typography.labelSmall,
                    color = MemoryMuted
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    PRESET_IMAGES.forEach { preset ->
                        Surface(
                            modifier = Modifier
                                .width(120.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .border(
                                    width = if (url == preset.url) 2.dp else 1.dp,
                                    color = if (url == preset.url) MemoryTerracotta else MemoryLine,
                                    shape = RoundedCornerShape(8.dp)
                                )
                                .clickable {
                                    url = preset.url
                                    if (title.isBlank()) title = preset.title
                                    if (location.isBlank()) location = preset.defaultLocation
                                    if (tagInput.isBlank()) tagInput = preset.defaultTags.joinToString(", ")
                                },
                            color = Color.White
                        ) {
                            Column {
                                AsyncImage(
                                    model = preset.url,
                                    contentDescription = preset.title,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(65.dp),
                                    contentScale = ContentScale.Crop
                                )
                                Text(
                                    text = preset.title,
                                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                                    color = MemoryInk,
                                    maxLines = 1,
                                    modifier = Modifier.padding(6.dp)
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // URL input
                OutlinedTextField(
                    value = url,
                    onValueChange = { url = it },
                    label = { Text("URL hình ảnh *") },
                    placeholder = { Text("https://images.unsplash.com/...") },
                    leadingIcon = { Icon(Icons.Outlined.Link, contentDescription = null, tint = MemoryMuted) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("memory_url_input"),
                    shape = RoundedCornerShape(8.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MemoryTerracotta,
                        unfocusedBorderColor = MemoryLine,
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    ),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Title input
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Tên kỷ niệm *") },
                    placeholder = { Text("Ví dụ: Đà Lạt mùa sương 2024") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("memory_title_input"),
                    shape = RoundedCornerShape(8.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MemoryTerracotta,
                        unfocusedBorderColor = MemoryLine,
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    ),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Description
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Cảm nghĩ / Ghi chú") },
                    placeholder = { Text("Những điều làm khoảnh khắc này đáng nhớ...") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    maxLines = 3,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MemoryTerracotta,
                        unfocusedBorderColor = MemoryLine,
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    )
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Location & Date in Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedTextField(
                        value = location,
                        onValueChange = { location = it },
                        label = { Text("Địa điểm") },
                        placeholder = { Text("Đà Lạt") },
                        leadingIcon = { Icon(Icons.Outlined.Place, contentDescription = null, tint = MemoryMuted) },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = MemoryTerracotta,
                            unfocusedBorderColor = MemoryLine,
                            focusedContainerColor = Color.White,
                            unfocusedContainerColor = Color.White
                        ),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = takenAt,
                        onValueChange = { takenAt = it },
                        label = { Text("Ngày chụp") },
                        leadingIcon = { Icon(Icons.Outlined.DateRange, contentDescription = null, tint = MemoryMuted) },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = MemoryTerracotta,
                            unfocusedBorderColor = MemoryLine,
                            focusedContainerColor = Color.White,
                            unfocusedContainerColor = Color.White
                        ),
                        singleLine = true
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Tags
                OutlinedTextField(
                    value = tagInput,
                    onValueChange = { tagInput = it },
                    label = { Text("Thẻ (phân cách bằng dấu phẩy)") },
                    placeholder = { Text("du lịch, hoàng hôn, bạn bè") },
                    leadingIcon = { Icon(Icons.Outlined.Label, contentDescription = null, tint = MemoryMuted) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MemoryTerracotta,
                        unfocusedBorderColor = MemoryLine,
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    ),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Album dropdown if albums exist
                if (albums.isNotEmpty()) {
                    ExposedDropdownMenuBox(
                        expanded = albumDropdownExpanded,
                        onExpandedChange = { albumDropdownExpanded = !albumDropdownExpanded },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        OutlinedTextField(
                            value = albums.find { it.id == selectedAlbumId }?.name ?: "Chưa chọn album",
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Album") },
                            leadingIcon = { Icon(Icons.Outlined.Collections, contentDescription = null, tint = MemoryMuted) },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = albumDropdownExpanded) },
                            modifier = Modifier
                                .menuAnchor()
                                .fillMaxWidth(),
                            shape = RoundedCornerShape(8.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = MemoryTerracotta,
                                unfocusedBorderColor = MemoryLine,
                                focusedContainerColor = Color.White,
                                unfocusedContainerColor = Color.White
                            )
                        )

                        ExposedDropdownMenu(
                            expanded = albumDropdownExpanded,
                            onDismissRequest = { albumDropdownExpanded = false }
                        ) {
                            DropdownMenuItem(
                                text = { Text("Không gán album") },
                                onClick = {
                                    selectedAlbumId = null
                                    albumDropdownExpanded = false
                                }
                            )
                            albums.forEach { album ->
                                DropdownMenuItem(
                                    text = { Text(album.name) },
                                    onClick = {
                                        selectedAlbumId = album.id
                                        albumDropdownExpanded = false
                                    }
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Submit Button
                Button(
                    onClick = {
                        val tags = tagInput.split(",")
                            .map { it.trim() }
                            .filter { it.isNotBlank() }
                        onAddMemory(
                            url.trim(),
                            title.trim(),
                            description.trim().ifBlank { null },
                            takenAt.trim().ifBlank { null },
                            tags,
                            selectedAlbumId,
                            location.trim().ifBlank { null }
                        )
                    },
                    enabled = url.isNotBlank(),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                        .testTag("submit_add_memory_button"),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MemoryInk,
                        contentColor = Color.White
                    )
                ) {
                    Icon(Icons.Filled.Check, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Lưu vào thư viện", fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}
