import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { fetchMovieDetails } from "@/services/api";
import useFetch from "@/services/useFetch";
import { icons } from "@/constants/icons";
import AsyncStorage from "@react-native-async-storage/async-storage"

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">{label}</Text>
    <Text className="text-light-100 font-bold text-sm mt-2">
      {value || "N/A"}
    </Text>
  </View>
);

const Details = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { data: movie, loading } = useFetch(() =>
    fetchMovieDetails(id as string)
  );

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, [movie])

  const checkIfSaved = async () => {
    try {
      const storedMovies = await AsyncStorage.getItem("savedMovies");
      const savedMovies = storedMovies ? JSON.parse(storedMovies) : [];
      const exists = savedMovies.some((m: any) => m.id === movie?.id);
      setIsSaved(exists)
    } catch (error) {
      console.log("Error checking saved movie:", error);
    }
  }

  const handleSaveMovies = async () => {
    try {
      const storedMovies = await AsyncStorage.getItem("savedMovies");
      let savedMovies = storedMovies ? JSON.parse(storedMovies) : [];

      if(isSaved) {
        savedMovies = savedMovies.filter((m: any) => m.id !== movie?.id);
        await AsyncStorage.setItem("savedMovies", JSON.stringify(savedMovies));
        setIsSaved(false);
        
      }else{
        savedMovies.push(movie);
        await AsyncStorage.setItem("savedMovies", JSON.stringify(savedMovies));
        setIsSaved(true);
        
      }
    } catch (error) {
      console.log("Error saving movie:", error)
    }
  }

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`,
            }}
            className="w-full h-[550px]"
            resizeMode="stretch"
          />

          <TouchableOpacity className="absolute bottom-5 right-5 rounded-full size-14 bg-white flex items-center justify-center">
            <Image
              source={icons.play}
              className="w-6 h-7 ml-1"
              resizeMode="stretch"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleSaveMovies} className="absolute top-10 right-5 rounded-full size-12 bg-dark-100 flex items-center justify-center">
          <Image
            source={isSaved ? icons.save : icons.save}
            className="w-6 h-6"
            tintColor={isSaved ? "red" : "white"}
          />
        </TouchableOpacity>

        <View className="flex-col items-start justify-center mt-5 px-5">
          <Text className="text-white font-bold text-xl">{movie?.title}m</Text>
          <View className="flex-row items-center gap-x-1 mt-2">
            <Text className="text-light-200 text-sm">
              {movie?.release_date?.split("-")[0]}
            </Text>
            <Text className="text-light-200 text-sm">{movie?.runtime}m</Text>
          </View>

          <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
            <Image source={icons.star} className="size-4" />
            <Text className="text-white font-bold text-sm">
              {Math.round(movie?.vote_average ?? 0)}/10
            </Text>
            <Text className="text-light-200 text-sm">
              ({movie?.vote_count} votes)
            </Text>
          </View>

          <MovieInfo label="Overview" value={movie?.overview} />
          <MovieInfo
            label="Genres"
            value={movie?.genres?.map((g) => g.name).join(" • ") || "N/A"}
          />

          <View className="flex flex-row justify-between w-1/2">
            <MovieInfo
              label="Budget"
              value={`$${(movie?.budget ?? 0) / 1_000_000} million`}
            />
            <MovieInfo
              label="Revenue"
              value={`$${Math.round(
                (movie?.revenue ?? 0) / 1_000_000
              )} million `}
            />
          </View>

          <MovieInfo
            label="Production Companies"
            value={
              movie?.production_companies?.map((c) => c.name).join(" • ") ||
              "N/A"
            }
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
        onPress={router.back}
      >
        <Image
          source={icons.arrow}
          className="size-5 mr-1 mt-0.5 rotate-180"
          tintColor={"#fff"}
        />
        <Text className="text-white font-semibold text-base">Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Details;
