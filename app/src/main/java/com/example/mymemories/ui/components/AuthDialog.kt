package com.example.mymemories.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.mymemories.data.model.UserAccountEntity
import com.example.mymemories.ui.theme.MemoryCream
import com.example.mymemories.ui.theme.MemoryInk
import com.example.mymemories.ui.theme.MemoryLine
import com.example.mymemories.ui.theme.MemoryMuted
import com.example.mymemories.ui.theme.MemorySage
import com.example.mymemories.ui.theme.MemoryTerracotta

@Composable
fun AuthDialog(
    currentUser: UserAccountEntity?,
    allUsers: List<UserAccountEntity>,
    onDismiss: () -> Unit,
    onSwitchOrLogin: (email: String, name: String) -> Unit
) {
    var email by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }
    var isSignUpMode by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp)),
            color = MemoryCream,
            shadowElevation = 24.dp
        ) {
            Column(
                modifier = Modifier.padding(24.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            modifier = Modifier.size(28.dp),
                            shape = CircleShape,
                            color = MemoryTerracotta
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    Icons.Filled.Favorite,
                                    contentDescription = null,
                                    tint = Color.White,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "MY MEMORIES",
                            style = MaterialTheme.typography.labelSmall,
                            letterSpacing = 2.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Filled.Close, contentDescription = "Đóng", tint = MemoryMuted)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = if (isSignUpMode) "TẠO KHÔNG GIAN RIÊNG" else "CHÀO MỪNG TRỞ LẠI",
                    style = MaterialTheme.typography.labelSmall,
                    color = MemoryTerracotta
                )

                Text(
                    text = if (isSignUpMode) "Nơi những khoảnh khắc\nở lại." else "Mở lại ký ức\ncủa bạn.",
                    style = MaterialTheme.typography.displaySmall.copy(
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Medium,
                        lineHeight = 28.sp
                    ),
                    color = MemoryInk
                )

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = "Mỗi tài khoản có một thư viện lưu trữ hoàn toàn riêng biệt và bảo mật.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MemoryMuted
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Input fields
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email tài khoản") },
                    placeholder = { Text("you@example.com") },
                    leadingIcon = { Icon(Icons.Outlined.Email, contentDescription = null, tint = MemoryMuted) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("auth_email_input"),
                    shape = RoundedCornerShape(8.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MemoryTerracotta,
                        unfocusedBorderColor = MemoryLine,
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    ),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Tên hiển thị (Tùy chọn)") },
                    placeholder = { Text("Ví dụ: Yến, Alex, ...") },
                    leadingIcon = { Icon(Icons.Outlined.Person, contentDescription = null, tint = MemoryMuted) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("auth_name_input"),
                    shape = RoundedCornerShape(8.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MemoryTerracotta,
                        unfocusedBorderColor = MemoryLine,
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    ),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(18.dp))

                Button(
                    onClick = {
                        if (email.isNotBlank()) {
                            onSwitchOrLogin(email.trim(), name.trim())
                        }
                    },
                    enabled = email.isNotBlank(),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                        .testTag("auth_submit_button"),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MemoryInk,
                        contentColor = Color.White
                    )
                ) {
                    Text(
                        text = if (isSignUpMode) "Tạo không gian ngay" else "Đăng nhập không gian",
                        fontWeight = FontWeight.SemiBold
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (isSignUpMode) "Đã có tài khoản?" else "Chưa có tài khoản?",
                        style = MaterialTheme.typography.bodySmall,
                        color = MemoryMuted
                    )
                    TextButton(onClick = { isSignUpMode = !isSignUpMode }) {
                        Text(
                            text = if (isSignUpMode) "Đăng nhập" else "Tạo không gian mới",
                            color = MemoryTerracotta,
                            fontWeight = FontWeight.SemiBold,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }

                // Existing accounts quick switcher
                if (allUsers.size > 1) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Hoặc chuyển nhanh tài khoản:",
                        style = MaterialTheme.typography.labelSmall,
                        color = MemoryMuted
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        allUsers.forEach { user ->
                            Surface(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(6.dp))
                                    .clickable { onSwitchOrLogin(user.email, user.displayName) },
                                color = if (user.id == currentUser?.id) MemoryTerracotta.copy(alpha = 0.1f) else Color.White,
                                border = androidx.compose.foundation.BorderStroke(1.dp, MemoryLine)
                            ) {
                                Row(
                                    modifier = Modifier.padding(10.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Surface(
                                            modifier = Modifier.size(24.dp),
                                            shape = CircleShape,
                                            color = MemoryTerracotta
                                        ) {
                                            Box(contentAlignment = Alignment.Center) {
                                                Text(user.avatarInitial, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                            }
                                        }
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(user.displayName, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
                                    }
                                    if (user.id == currentUser?.id) {
                                        Icon(Icons.Outlined.Check, contentDescription = null, tint = MemorySage, modifier = Modifier.size(16.dp))
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
