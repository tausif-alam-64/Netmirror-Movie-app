import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback } from "react";

const Saved = () => {
  const [savedMovies, setSavedMovies] = useState<any[]>([]);
  const router = useRouter();

  // ✅ Fetch saved movies from AsyncStorage
  const getSavedMovies = async () => {
    try {
      const storedMovies = await AsyncStorage.getItem("savedMovies");
      const parsed = storedMovies ? JSON.parse(storedMovies) : [];
      setSavedMovies(parsed);
    } catch (err) {
      console.log("Error fetching saved movies:", err);
    }
  };

  // ✅ Refresh when user comes back to tab
  useFocusEffect(
    useCallback(() => {
      getSavedMovies();
    }, [])
  );

  return (
    <View className="bg-primary flex-1 px-4 pt-6">
      <Text className="text-white text-xl font-bold mb-4">Saved Movies</Text>

      {savedMovies.length === 0 ? (
        <Text className="text-light-200 text-center mt-10">
          No saved movies yet 😢
        </Text>
      ) : (
        <FlatList
          data={savedMovies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="mb-4 flex-row items-center"
              onPress={() => router.push(`/movies/${item.id}`)} // ✅ route matches your folder app/movies/[id].tsx
            >
              <Image
                source={{
                  uri: `https://image.tmdb.org/t/p/w200${item.poster_path}`,
                }}
                className="w-24 h-36 rounded-lg mr-3"
              />
              <View className="flex-1">
                <Text className="text-white font-bold text-lg">
                  {item.title}
                </Text>
                <Text className="text-light-200 text-sm mt-1">
                  {item.release_date?.split("-")[0]} •{" "}
                  {Math.round(item.vote_average)}/10
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default Saved;
