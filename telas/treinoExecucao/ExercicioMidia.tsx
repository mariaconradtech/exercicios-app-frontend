import React from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { WebView } from 'react-native-webview';

type ExercicioMidiaProps = {
  videoUrl?: string;
  duracaoTotalSegundos?: number;
  isPaused?: boolean;
  /** Velocidade de reprodução cadastrada no exercício (1 = original). */
  velocidade?: number;
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

// Sem controles (que exibem a duração original) e em loop, já que o tempo é do treino.
// O parâmetro `playlist` com o próprio id é exigido pelo YouTube para o `loop` funcionar.
function parametrosEmbed(videoId: string): string {
  return `playsinline=1&controls=0&loop=1&playlist=${videoId}&autoplay=1&mute=1`;
}

function getYouTubeEmbedUrl(url: string): string {
  try {
    const parsed = new URL(normalizeUrl(url));
    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname;

    if (hostname === 'youtu.be') {
      const id = pathname.slice(1);
      return `https://www.youtube.com/embed/${id}?${parametrosEmbed(id)}`;
    }

    if (pathname.startsWith('/shorts/')) {
      const id = pathname.split('/shorts/')[1];
      return `https://www.youtube.com/embed/${id}?${parametrosEmbed(id)}`;
    }

    if (parsed.searchParams.has('v')) {
      const id = parsed.searchParams.get('v') ?? '';
      return `https://www.youtube.com/embed/${id}?${parametrosEmbed(id)}`;
    }

    if (pathname.startsWith('/embed/')) {
      const id = pathname.split('/embed/')[1];
      return `https://www.youtube.com/embed/${id}?${parametrosEmbed(id)}`;
    }

    return normalizeUrl(url);
  } catch {
    return normalizeUrl(url);
  }
}

export default function ExercicioMidia({
  videoUrl,
  duracaoTotalSegundos,
  isPaused = false,
  velocidade,
}: ExercicioMidiaProps) {
  const taxaReproducao = typeof velocidade === 'number' && velocidade > 0 ? velocidade : 1;
  const [erroVideo, setErroVideo] = React.useState(false);
  const nativeVideoRef = React.useRef<any>(null);
  const webVideoRef = React.useRef<any>(null);
  const isYouTube = videoUrl ? isYouTubeUrl(videoUrl) : false;
  const shouldLoopVideo =
    typeof duracaoTotalSegundos === 'number' ? duracaoTotalSegundos > 0 && !isPaused : !isPaused;
  const sourceUri = videoUrl
    ? isYouTube
      ? getYouTubeEmbedUrl(videoUrl)
      : normalizeUrl(videoUrl)
    : undefined;

  React.useEffect(() => {
    if (!videoUrl) {
      return;
    }

    if (isPaused) {
      nativeVideoRef.current?.pauseAsync?.().catch(() => {});
      if (webVideoRef.current) {
        webVideoRef.current.pause?.();
      }
      return;
    }

    nativeVideoRef.current?.playAsync?.().catch(() => {});
    if (webVideoRef.current) {
      webVideoRef.current.play?.().catch(() => {});
    }
  }, [isPaused, videoUrl]);

  // No <video> do navegador a velocidade é propriedade do elemento, não atributo.
  // defaultPlaybackRate garante que ela se mantenha quando o vídeo recarrega/reinicia.
  const aplicarVelocidadeWeb = React.useCallback(() => {
    const elemento = webVideoRef.current;
    if (elemento) {
      elemento.defaultPlaybackRate = taxaReproducao;
      elemento.playbackRate = taxaReproducao;
    }
  }, [taxaReproducao]);

  React.useEffect(() => {
    aplicarVelocidadeWeb();
  }, [aplicarVelocidadeWeb, sourceUri]);

  return (
    <View style={styles.container}>
      {sourceUri && !erroVideo ? (
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
          Platform.OS === 'web' ? (
            <video
              ref={webVideoRef}
              playsInline
              muted
              preload="metadata"
              autoPlay={!isPaused}
              loop={shouldLoopVideo}
              src={sourceUri}
              style={styles.video}
              onLoadedMetadata={aplicarVelocidadeWeb}
              onError={() => setErroVideo(true)}
            />
          ) : (
            <Video
              ref={nativeVideoRef}
              source={{ uri: sourceUri }}
              style={styles.video}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={!isPaused}
              isLooping={shouldLoopVideo}
              rate={taxaReproducao}
              shouldCorrectPitch
              onError={() => setErroVideo(true)}
            />
          )
        )
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            {erroVideo ? 'Não foi possível carregar o vídeo.' : 'Vídeo não disponível'}
          </Text>
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
