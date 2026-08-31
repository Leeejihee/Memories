package com.example.mymemories.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.example.mymemories.data.model.AlbumEntity
import com.example.mymemories.data.model.MemoryEntity
import com.example.mymemories.data.model.UserAccountEntity

@Database(
    entities = [MemoryEntity::class, AlbumEntity::class, UserAccountEntity::class],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun memoryDao(): MemoryDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "my_memories_database"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
