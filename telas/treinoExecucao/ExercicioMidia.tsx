import React from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { WebView } from 'react-native-webview';

type ExercicioMidiaProps = {
  videoUrl?: string;
};

const YOUTUBE_HOSTS = [
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
];

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

function isYouTubeUrl(url: string): boolean {
  try {
    const parsed = new URL(normalizeUrl(url));
    const hostname = parsed.hostname.toLowerCase();
    return YOUTUBE_HOSTS.some((entry) => hostname.endsWith(entry));
  } catch {
    return false;
  }
}

function getYouTubeEmbedUrl(url: string): string {
  try {
    const parsed = new URL(normalizeUrl(url));
    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname;

    if (hostname === 'youtu.be') {
      return `https://www.youtube.com/embed/${pathname.slice(1)}?playsinline=1`;
    }

    if (pathname.startsWith('/shorts/')) {
      return `https://www.youtube.com/embed/${pathname.split('/shorts/')[1]}?playsinline=1`;
    }

    if (parsed.searchParams.has('v')) {
      return `https://www.youtube.com/embed/${parsed.searchParams.get('v')}?playsinline=1`;
    }

    if (pathname.startsWith('/embed/')) {
      return `${normalizeUrl(url)}?playsinline=1`;
    }

    return normalizeUrl(url);
  } catch {
    return normalizeUrl(url);
  }
}

export default function ExercicioMidia({ videoUrl }: ExercicioMidiaProps) {
  const isYouTube = videoUrl ? isYouTubeUrl(videoUrl) : false;
  const sourceUri = videoUrl
    ? isYouTube
      ? getYouTubeEmbedUrl(videoUrl)
      : normalizeUrl(videoUrl)
    : undefined;

  return (
    <View style={styles.container}>
      {sourceUri ? (
        isYouTube ? (
          Platform.OS === 'web' ? (
            <iframe
              title="Exercício YouTube"
              src={sourceUri}
              style={styles.video}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <WebView
              source={{ uri: sourceUri }}
              style={styles.video}
              javaScriptEnabled
              domStorageEnabled
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction={false}
              originWhitelist={['*']}
            />
          )
        ) : (
          <Video
            source={{ uri: sourceUri }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
            isLooping={false}
          />
        )
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Vídeo não disponível</Text>
          {videoUrl ? <Text style={styles.placeholderText}>{videoUrl}</Text> : null}
        </View>
      )}
      {Platform.OS === 'web' && isYouTube ? (
        <Text style={styles.debugText}>YouTube embed: {sourceUri}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    height: 260,
    borderRadius: 18,
    backgroundColor: '#eceef2',
    overflow: 'hidden',
  },
  video: {
    flex: 1,
    width: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#7a7f8c',
    fontSize: 16,
    textAlign: 'center',
  },
  debugText: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    right: 12,
    fontSize: 11,
    color: '#5f6773',
  },
});
