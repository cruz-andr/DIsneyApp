import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import YoutubePlayer from 'react-native-youtube-iframe';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JeopardyEpisode, JeopardyQuestion, JeopardyGameSession } from '../types';

type JeopardyStackParamList = {
  JeopardyLobby: undefined;
  JeopardyVideo: { episode: JeopardyEpisode };
};

type NavigationProp = StackNavigationProp<JeopardyStackParamList, 'JeopardyVideo'>;
type RouteProps = RouteProp<JeopardyStackParamList, 'JeopardyVideo'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function JeopardyVideoScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { episode } = route.params;

  const playerRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [score, setScore] = useState(0);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<JeopardyQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [gameSession, setGameSession] = useState<JeopardyGameSession | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Sample time mappings (in production, these would come from a database)
  const sampleQuestions: JeopardyQuestion[] = [
    {
      id: 'q1',
      episodeId: episode.id,
      category: 'Disney Princesses',
      categoryIndex: 0,
      value: 200,
      question: 'This princess was the first to receive a star on the Hollywood Walk of Fame',
      answer: 'Who is Snow White?',
      isDailyDouble: false,
      startTime: 30, // 30 seconds into video
      endTime: 45,
      answerRevealTime: 50,
    },
    {
      id: 'q2',
      episodeId: episode.id,
      category: 'Disney Princesses',
      categoryIndex: 0,
      value: 400,
      question: 'She is the only Disney princess who is not actually royalty by birth or marriage',
      answer: 'Who is Mulan?',
      isDailyDouble: false,
      startTime: 60,
      endTime: 75,
      answerRevealTime: 80,
    },
    // Add more questions as needed
  ];

  useEffect(() => {
    initializeGameSession();
  }, []);

  const initializeGameSession = async () => {
    const session: JeopardyGameSession = {
      id: `session_${Date.now()}`,
      episodeId: episode.id,
      playerName: 'Player',
      score: 0,
      questionsAnswered: [],
      gameMode: 'watch-along',
      startedAt: new Date(),
    };
    setGameSession(session);
  };

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') {
      handleGameEnd();
    }
  }, []);

  const handleTimeUpdate = useCallback(async () => {
    if (!playerRef.current) return;
    
    const time = await playerRef.current.getCurrentTime();
    setCurrentTime(time);

    // Check if we've reached a question point
    const question = sampleQuestions.find(
      q => time >= q.startTime && time < q.endTime && !gameSession?.questionsAnswered.find(a => a.questionId === q.id)
    );

    if (question) {
      pauseForQuestion(question);
    }
  }, [gameSession, sampleQuestions]);

  const pauseForQuestion = (question: JeopardyQuestion) => {
    setPlaying(false);
    setCurrentQuestion(question);
    setShowQuestionModal(true);
    setUserAnswer('');
    setShowAnswer(false);
  };

  const handleAnswerSubmit = () => {
    if (!currentQuestion || !gameSession) return;

    // Simple answer checking (in production, use better matching)
    const isCorrect = userAnswer.toLowerCase().includes(
      currentQuestion.answer.toLowerCase().replace('who is ', '').replace('what is ', '').replace('?', '')
    );

    const pointsEarned = isCorrect ? currentQuestion.value : 0;
    setScore(score + pointsEarned);

    // Update game session
    const updatedSession = {
      ...gameSession,
      score: gameSession.score + pointsEarned,
      questionsAnswered: [
        ...gameSession.questionsAnswered,
        {
          questionId: currentQuestion.id,
          userAnswer,
          correct: isCorrect,
          timeToAnswer: 0,
          pointsEarned,
        },
      ],
    };
    setGameSession(updatedSession);

    setShowAnswer(true);
  };

  const handleContinue = () => {
    setShowQuestionModal(false);
    setCurrentQuestion(null);
    setPlaying(true);
  };

  const handleGameEnd = async () => {
    if (!gameSession) return;

    const completedSession = {
      ...gameSession,
      completedAt: new Date(),
    };

    // Save to AsyncStorage
    try {
      const sessionsKey = 'jeopardy_sessions';
      const existingSessions = await AsyncStorage.getItem(sessionsKey);
      const sessions = existingSessions ? JSON.parse(existingSessions) : [];
      sessions.push(completedSession);
      await AsyncStorage.setItem(sessionsKey, JSON.stringify(sessions));

      Alert.alert(
        'Game Complete!',
        `Final Score: ${score}\nQuestions Answered: ${gameSession.questionsAnswered.length}`,
        [
          { text: 'View Stats', onPress: () => navigation.navigate('JeopardyLobby') },
          { text: 'Play Again', onPress: () => initializeGameSession() },
        ]
      );
    } catch (error) {
      console.error('Error saving game session:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {episode.title}
        </Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>${score}</Text>
        </View>
      </View>

      <View style={styles.playerContainer}>
        <YoutubePlayer
          ref={playerRef}
          height={screenWidth * 0.56} // 16:9 aspect ratio
          videoId={episode.videoId}
          play={playing}
          onChangeState={onStateChange}
          onReady={() => setIsReady(true)}
          webViewProps={{
            allowsInlineMediaPlayback: true,
            mediaPlaybackRequiresUserAction: false,
          }}
        />
        
        {!isReady && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </View>

      {showControls && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setPlaying(!playing)}
          >
            <Ionicons
              name={playing ? 'pause' : 'play'}
              size={30}
              color="#fff"
            />
          </TouchableOpacity>
          
          <View style={styles.timeDisplay}>
            <Text style={styles.timeText}>
              {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => {
              // Skip to next question
              const nextQuestion = sampleQuestions.find(q => q.startTime > currentTime);
              if (nextQuestion && playerRef.current) {
                playerRef.current.seekTo(nextQuestion.startTime);
              }
            }}
          >
            <Ionicons name="play-skip-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Episode #{episode.episodeNumber}</Text>
        <Text style={styles.infoDescription}>{episode.description}</Text>
        
        <View style={styles.categoriesSection}>
          <Text style={styles.categoriesTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {episode.categories.map((category, index) => (
              <View key={index} style={styles.categoryCard}>
                <Text style={styles.categoryName}>{category}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal
        isVisible={showQuestionModal}
        style={styles.modal}
        onBackdropPress={() => {}}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.modalContent}>
          {currentQuestion && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.categoryLabel}>{currentQuestion.category}</Text>
                <Text style={styles.valueLabel}>${currentQuestion.value}</Text>
              </View>

              <Text style={styles.questionText}>{currentQuestion.question}</Text>

              {!showAnswer ? (
                <>
                  <TextInput
                    style={styles.answerInput}
                    placeholder="What is your answer?"
                    value={userAnswer}
                    onChangeText={setUserAnswer}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleAnswerSubmit}
                  />
                  
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleAnswerSubmit}
                  >
                    <Text style={styles.submitButtonText}>Submit Answer</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.resultContainer}>
                    <Text style={styles.correctAnswer}>
                      Correct Answer: {currentQuestion.answer}
                    </Text>
                    <Text style={styles.yourAnswer}>
                      Your Answer: {userAnswer || 'No answer'}
                    </Text>
                    {userAnswer.toLowerCase().includes(
                      currentQuestion.answer.toLowerCase().replace('who is ', '').replace('what is ', '').replace('?', '')
                    ) ? (
                      <View style={styles.correctBadge}>
                        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                        <Text style={styles.correctText}>Correct! +${currentQuestion.value}</Text>
                      </View>
                    ) : (
                      <View style={styles.incorrectBadge}>
                        <Ionicons name="close-circle" size={24} color="#F44336" />
                        <Text style={styles.incorrectText}>Incorrect</Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={handleContinue}
                  >
                    <Text style={styles.continueButtonText}>Continue</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#1a1a1a',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginHorizontal: 10,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#999',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  playerContainer: {
    backgroundColor: '#000',
    position: 'relative',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#1a1a1a',
    gap: 20,
  },
  controlButton: {
    padding: 10,
  },
  timeDisplay: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  categoriesSection: {
    marginTop: 10,
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryName: {
    fontSize: 14,
    color: '#1E88E5',
    fontWeight: '500',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: screenHeight * 0.5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  categoryLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E88E5',
  },
  valueLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
    marginBottom: 30,
    lineHeight: 28,
  },
  answerInput: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    marginBottom: 30,
  },
  correctAnswer: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  yourAnswer: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  correctBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 10,
  },
  correctText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  incorrectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 10,
  },
  incorrectText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});