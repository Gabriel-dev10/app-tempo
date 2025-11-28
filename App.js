import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';

export default function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchWeather() {
    if (!city) return;
    setLoading(true);

    try {
      // 1. Buscar latitude e longitude
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setWeather(null);
        alert("Cidade não encontrada!");
        setLoading(false);
        return;
      }

      const { latitude, longitude, name } = geoData.results[0];

      // 2. Buscar clima
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const weatherData = await weatherRes.json();

      if (!weatherData.current_weather) {
        alert("Erro ao buscar clima.");
        setLoading(false);
        return;
      }

      setWeather({
        city: name,
        temp: weatherData.current_weather.temperature,
        wind: weatherData.current_weather.windspeed,
        code: weatherData.current_weather.weathercode
      });

    } catch (error) {
      alert("Erro ao buscar dados.");
      console.log(error);
    }

    setLoading(false);
  }

  // traduzir código do clima
  function getWeatherDescription(code) {
    const map = {
      0: "Céu limpo",
      1: "Principalmente limpo",
      2: "Parcialmente nublado",
      3: "Nublado",
      45: "Névoa",
      48: "Névoa congelante",
      51: "Garoa leve",
      53: "Garoa moderada",
      55: "Garoa intensa",
      61: "Chuva leve",
      63: "Chuva moderada",
      65: "Chuva forte",
      80: "Aguaceiros leves",
      81: "Aguaceiros moderados",
      82: "Aguaceiros fortes",
    };
    return map[code] || "Clima desconhecido";
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Previsão do Tempo</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite o nome da cidade"
        value={city}
        onChangeText={setCity}
      />

      <TouchableOpacity style={styles.button} onPress={fetchWeather}>
        <Text style={styles.buttonText}>Buscar</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#000" />}

      {weather && (
        <View style={styles.result}>
          <Text style={styles.city}>{weather.city}</Text>
          <Text style={styles.temp}>{weather.temp}°C</Text>
          <Text style={styles.desc}>{getWeatherDescription(weather.code)}</Text>
          <Text style={styles.wind}>Vento: {weather.wind} km/h</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f1f1f1'
  },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  input: {
    width: '100%',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 20
  },
  buttonText: { color: '#fff', fontSize: 18 },
  result: {
    backgroundColor: '#fff',
    padding: 20,
    width: "100%",
    borderRadius: 10,
    alignItems: 'center'
  },
  city: { fontSize: 24, fontWeight: "bold" },
  temp: { fontSize: 40, marginVertical: 10 },
  desc: { fontSize: 18 },
  wind: { fontSize: 16, marginTop: 5, color: '#555' }
});
