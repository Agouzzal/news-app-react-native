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

const HeroCard = ({ item, router }) => {
  if (!item) return null;

  return (
    <Pressable
      style={styles.heroContainer}
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
      <Image
        style={styles.heroImage}
        source={{ uri: item.image }}
        resizeMode="cover"
      />
      <View style={styles.heroContent}>
        <Text style={styles.heroTitle}>{item.title}</Text>
        <Text style={styles.heroDescription} numberOfLines={3}>
          {item.body}
        </Text>
      </View>
    </Pressable>
  );
};

const ArticleCard = ({ item, router }) => (
  <Pressable
    style={styles.cardContainer}
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
    <Image
      style={styles.cardImage}
      source={{ uri: item.image }}
      resizeMode="cover"
    />
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardDate}>{item.date}</Text>
        <Text style={styles.cardSource}>{item.source.title}</Text>
      </View>
    </View>
  </Pressable>
);

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
    const abortController = new AbortController();
    const signal = abortController.signal;

    setLoading(true);

    const baseQuery = {
      query: {
        $query: apiQuery.$query,
        $filter: {
          forceMaxDataTimeWindow: "31",
          startSourceRankPercentile: 0,
          endSourceRankPercentile: 50,
          isDuplicate: "skipDuplicates",
        },
      },
      resultType: "articles",
      includeSourceRanking: true,
      apiKey: API_KEY,
    };

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...baseQuery,
        articlesSortBy: "sourceImportance",
        articlesCount: 1,
      }),
      signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Hero Fetch Error: ${res.status}`);
        return res.json();
      })
      .then((heroJson) => {
        const heroCandidate = heroJson.articles.results[0];

        return fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...baseQuery,
            articlesSortBy: "date",
          }),
          signal,
        })
          .then((res) => {
            if (!res.ok)
              throw new Error(`Main List Fetch Error: ${res.status}`);
            return res.json();
          })
          .then((mainJson) => {
            const mainList = mainJson.articles.results;

            const combinedList = [heroCandidate, ...mainList].filter(
              (item) => item && item.image && item.image.startsWith("http")
            );

            const seenUris = new Set();
            const finalFilteredList = combinedList.filter((item) => {
              const isNew = !seenUris.has(item.uri);
              seenUris.add(item.uri);
              return isNew;
            });

            setArticles(finalFilteredList);
            setLoading(false);
          });
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          console.log("Fetch annulé.");
          return;
        }
        console.log("Erreur lors du fetch des articles:", err);
        setLoading(false);
      });

    return () => {
      abortController.abort();
    };
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

  const heroArticle = articles[0];
  const remainingArticles = articles.slice(1);

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
          placeholder="Search for an article..."
          placeholderTextColor="#8E8E93"
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
          onSubmitEditing={handleSearchSubmit}
        />
        <Pressable onPress={handleRefresh} style={styles.reloadButton}>
          <Ionicons name="reload-circle-outline" size={24} color="#8E8E93" />
        </Pressable>
      </View>

      {loading && (
        <ActivityIndicator
          size="large"
          color="#c4271eff"
          style={{ marginTop: 20 }}
        />
      )}

      {!loading && articles.length === 0 && (
        <Text style={{ color: "#fff", textAlign: "center", marginTop: 50 }}>
          Aucun article trouvé.
        </Text>
      )}

      <FlatList
        data={remainingArticles}
        renderItem={({ item }) => <ArticleCard item={item} router={router} />}
        keyExtractor={(item) => item.uri}
        ListHeaderComponent={() => (
          <HeroCard item={heroArticle} router={router} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 25,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Lato_400Regular",
  },
  reloadButton: {
    marginLeft: 8,
  },

  heroContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: 250,
  },
  heroContent: {
    padding: 16,
  },
  heroTitle: {
    fontFamily: "Merriweather_700Bold",
    fontSize: 24,
    marginBottom: 8,
    color: "#FFF",
  },
  heroDescription: {
    fontFamily: "Lato_400Regular",
    fontSize: 16,
    color: "#AEAEB2",
    lineHeight: 22,
  },

  cardContainer: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 180,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontFamily: "Merriweather_700Bold",
    fontSize: 18,
    color: "#FFF",
    lineHeight: 24,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  cardDate: {
    fontFamily: "Lato_400Regular",
    fontSize: 12,
    color: "#8E8E93",
  },
  cardSource: {
    fontFamily: "Lato_400Regular",
    fontSize: 12,
    color: "#c4271eff",
    fontWeight: "bold",
  },
});
