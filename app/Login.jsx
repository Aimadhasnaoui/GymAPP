import { useVideoPlayer, VideoView } from "expo-video";
import { AlertCircle } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { loginMember } from "../services/Member";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const player = useVideoPlayer(
    require("../assets/images/gymLogin.mp4"),
    (p) => {
      p.loop = true;
      p.muted = true;
      p.play();
    },
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "", submit: "" });
  const [isloading, setisloading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const validateEmail = (value) => {
    if (!value.trim()) {
      return "L'email est requis";
    }
    if (!/\S+@\S+\.\S+/.test(value)) {
      return "Email invalide";
    }
    return "";
  };

  const validatePassword = (value) => {
    if (!value.trim()) {
      return "Le mot de passe est requis";
    }
    return "";
  };

  const handleSubmit = () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({ email: emailError, password: passwordError, submit: "" });

    if (!emailError && !passwordError) {
      setisloading(true);
      loginMember(email.trim(), password)
        .then(async (res) => {
          setisloading(false);
          // Save session — AuthContext handles storage + routing
          await login(res);
          console.log(res);
        })
        .catch((err) => {
          let message = "Une erreur est survenue. Veuillez réessayer.";
          if (err.message === "Network Error") {
            message = "Impossible de se connecter au serveur.";
          } else if (err.response?.data?.message) {
            message = err.response.data.message;
          } else if (
            err.response?.status === 401 ||
            err.response?.status === 404
          ) {
            message = "Email ou mot de passe incorrect.";
          }
          setErrors((prev) => ({ ...prev, submit: message }));
          setisloading(false);
        });
    }
  };

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={50}
      behavior="padding"
      style={styles.keyboardView}
    >
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        fullscreenOptions={{ allowsVideoFrame: false }}
        allowsPictureInPicture={false}
      />

      <View style={[StyleSheet.absoluteFill, styles.overlay]} />

      <View style={styles.contentWrapper}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formContainer}>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>GYM Access</Text>
                <Text style={styles.headerSubTitle}>
                  Entrez votre email et mot de passe pour continuer
                </Text>
                {errors.submit ? (
                  <View style={styles.errorBanner}>
                    <AlertCircle color="white" size={20} />
                    <Text style={styles.errorBannerText}>{errors.submit}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  placeholder="exemple@email.com"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errors.email)
                      setErrors({ ...errors, email: validateEmail(val) });
                  }}
                  onFocus={() => setFocusedInput("email")}
                  onBlur={() => setFocusedInput(null)}
                  style={[
                    styles.input,
                    focusedInput === "email" && styles.focusedInput,
                    errors.email && styles.errorInput,
                  ]}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {errors.email ? (
                  <Text style={styles.errorText}>{errors.email}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mot de passe</Text>
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errors.password)
                      setErrors({ ...errors, password: validatePassword(val) });
                  }}
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput(null)}
                  style={[
                    styles.input,
                    focusedInput === "password" && styles.focusedInput,
                    errors.password && styles.errorInput,
                  ]}
                  secureTextEntry
                />
                {errors.password ? (
                  <Text style={styles.errorText}>{errors.password}</Text>
                ) : null}
              </View>

              <Pressable
                onPress={handleSubmit}
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && styles.pressedButton,
                ]}
              >
                {!isloading ? (
                  <Text style={styles.submitButtonText}>Se connecter</Text>
                ) : (
                  <ActivityIndicator size="small" color="#000" />
                )}
              </Pressable>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    backgroundColor: "rgba(141, 252, 146, 0.1)",
  },
  contentWrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: "center",
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 36,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  headerSubTitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
  },
  errorBanner: {
    marginTop: 20,
    backgroundColor: "rgba(239, 68, 68, 0.8)",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
  },
  errorBannerText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 20,
  },
  inputLabel: {
    color: "white",
    marginBottom: 8,
    fontWeight: "700",
    fontSize: 14,
    textTransform: "uppercase",
  },
  input: {
    color: "white",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  focusedInput: {
    borderColor: "white",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  errorInput: {
    borderColor: "#f87171",
  },
  errorText: {
    color: "#f87171",
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "white",
    width: "100%",
    paddingVertical: 18,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  pressedButton: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  submitButtonText: {
    textAlign: "center",
    color: "green",
    fontWeight: "800",
    fontSize: 18,
    textTransform: "uppercase",
  },
});
