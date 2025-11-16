import { useRouter } from "expo-router";
import { API_KEY } from "../../../config.local";

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";

export default function Index() {
  const [articles, setarticles] = useState([]);
  const url = "https://eventregistry.org/api/v1/article/getArticles";

  useEffect(() => {
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: {
          $query: {
            $or: [{ lang: "eng" }],
          },
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
      .then((json) => {const allArticles = json.articles.results;
        const articlesWithImages = allArticles.filter(item => item.image !== null);
        setarticles(articlesWithImages)
        setarticles(articlesWithImages);})
      .catch((err) => console.log("Erreur :", err));
  }, []);

  const router = useRouter();

  return (
    <View style={styles.container}>
      <FlatList
        data={articles}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/details",
                params: {
                  articleImage: item.image, 
                  articleTitle: item.title, 
                  articleBody: item.body,
                  articleDate :item.date
                },
              })
            }
          >
            <View style={styles.itemContainer}>
              <View style={styles.textContent}>
                <Text style={styles.title}>{item.title}</Text>

                <Text style={styles.description} numberOfLines={3}>
                  {item.body}
                </Text>

                <Text style={styles.date}>{item.date}</Text>
              </View>

              <Image style={styles.image} source={{ uri: item.image }} />
            </View>
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
});
