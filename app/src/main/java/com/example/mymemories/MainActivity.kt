package com.example.mymemories

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import com.example.mymemories.ui.MainScreen
import com.example.mymemories.ui.theme.MyMemoriesTheme
import com.example.mymemories.ui.viewmodel.MemoryViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: MemoryViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyMemoriesTheme {
                MainScreen(viewModel = viewModel)
            }
        }
    }
}
