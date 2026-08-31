package com.example.mymemories.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val LightColorScheme = lightColorScheme(
    primary = MemoryTerracotta,
    onPrimary = Color.White,
    primaryContainer = MemoryPeach,
    onPrimaryContainer = MemoryTerracottaDark,
    secondary = MemoryInk,
    onSecondary = Color.White,
    secondaryContainer = MemoryCardCream,
    onSecondaryContainer = MemoryInk,
    tertiary = MemorySage,
    onTertiary = Color.White,
    tertiaryContainer = MemorySageLight,
    onTertiaryContainer = Color(0xFF2C553C),
    background = MemoryCream,
    onBackground = MemoryInk,
    surface = MemoryWarmSurface,
    onSurface = MemoryInk,
    surfaceVariant = MemoryCardCream,
    onSurfaceVariant = MemoryMuted,
    outline = MemoryLine,
    outlineVariant = Color(0xFFDCD7CE)
)

private val DarkColorScheme = darkColorScheme(
    primary = MemoryTerracotta,
    onPrimary = Color.White,
    primaryContainer = Color(0xFF4A2016),
    onPrimaryContainer = MemoryPeach,
    secondary = Color(0xFFE8E4DC),
    onSecondary = MemoryDarkCanvas,
    secondaryContainer = MemoryDarkSurface,
    onSecondaryContainer = Color(0xFFEEECE6),
    tertiary = MemorySage,
    onTertiary = MemoryDarkCanvas,
    background = MemoryDarkCanvas,
    onBackground = Color(0xFFF1E8D9),
    surface = MemoryDarkSurface,
    onSurface = Color(0xFFF1E8D9),
    outline = Color(0xFF403C36)
)

@Composable
fun MyMemoriesTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
