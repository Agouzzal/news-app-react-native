import { useRouter } from "expo-router";
import { API_KEY } from "../../../config.local";
import Ionicons from "@expo/vector-icons/Ionicons";

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Pressable,
  TextInput,
  ActivityIndicator, 
} from "react-native";

export default function Index() {
  const [articles, setArticles] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false); 

  const [apiQuery, setApiQuery] = useState({
    $query: { lang: "eng" }, 
  });

  const url = "https://eventregistry.org/api/v1/article/getArticles";
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    setArticles([]);

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: {
          $query: apiQuery.$query,
          $filter: {
            forceMaxDataTimeWindow: "31",
            startSourceRankPercentile: 0,
            endSourceRankPercentile: 60,
            isDuplicate: "skipDuplicates",
          },
        },
        resultType: "articles",
        articlesSortBy: "date",
        includeSourceRanking: true,
        apiKey: API_KEY,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        const allArticles = json.articles.results;
        const articlesWithImages = allArticles.filter(
          (item) => item.image !== null
        );
        setArticles(articlesWithImages);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Erreur :", err);
        setLoading(false);
      });
  }, [apiQuery]);

  const handleSearchSubmit = () => {
    if (searchText === "") {
      setApiQuery({ $query: { lang: "eng" } });
    } else {
      setApiQuery({ $query: { lang: "eng", keyword: searchText } });
    }
  };

  const handleRefresh = () => {
    setSearchText(""); 
    setApiQuery({ $query: { lang: "eng" } }); 
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#8E8E93"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un article..."
          placeholderTextColor="#8E8E93"
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
          onSubmitEditing={handleSearchSubmit}

        />
        <Pressable onPress={handleRefresh} style={styles.reloadButton}>
          <Ionicons 
            name="reload-circle-outline" 
            size={24} 
            color="#8E8E93"
          />
        </Pressable>
      </View>

      {loading && <ActivityIndicator size="large" color="#c4271eff" />}

      <FlatList
        data={articles}
        renderItem={({ item }) => (
          <Pressable
            style={styles.itemContainer}
            onPress={() =>
              router.push({
                pathname: "/details",
                params: {
                  articleImage: item.image,
                  articleTitle: item.title,
                  articleBody: item.body,
                  articleDate: item.date,
                },
              })
            }
          >
            <View style={styles.textContent}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description} numberOfLines={3}>
                {item.body}
              </Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
            <Image style={styles.image} source={{ uri: item.image }} />
          </Pressable>
        )}
        keyExtractor={(item) => item.uri}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1C1E",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    borderRadius: 8,
    marginHorizontal: 12,
    marginVertical: 8,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: "#FFFFFF",
    fontSize: 16,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#2C2C2E",
    marginVertical: 8,
    marginHorizontal: 12,
    padding: 10,
    borderRadius: 8,
  },
  textContent: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#c4271eff",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  description: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 5,
  },
  date: {
    fontSize: 12,
    color: "#ec554dff",
    marginTop: 8,
  },
  reloadButton: {
    marginLeft: 8, 
    padding: 2,
  },
});
