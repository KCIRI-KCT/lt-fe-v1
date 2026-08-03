# Android App Version Compatibility Report

## Project Configuration

This Android application uses the following SDK configuration from `variables.gradle`:

```gradle
ext {
    minSdkVersion = 24
    compileSdkVersion = 36
    targetSdkVersion = 36
    androidxActivityVersion = '1.11.0'
    androidxAppCompatVersion = '1.7.1'
    androidxCoordinatorLayoutVersion = '1.3.0'
    androidxCoreVersion = '1.17.0'
    androidxFragmentVersion = '1.8.9'
    coreSplashScreenVersion = '1.2.0'
    androidxWebkitVersion = '1.14.0'
    junitVersion = '4.13.2'
    androidxJunitVersion = '1.3.0'
    androidxEspressoCoreVersion = '3.7.0'
    cordovaAndroidVersion = '14.0.1'
}
```

---

# Android SDK Version Details

| Configuration | API Level | Android Version | Purpose |
|--------------|-----------|----------------|---------|
| `minSdkVersion` | 24 | Android 7.0 (Nougat) | Minimum Android version required to install and run the app |
| `targetSdkVersion` | 36 | Android 16 | Android version the app is optimized and tested for |
| `compileSdkVersion` | 36 | Android 16 | Android SDK version used to compile the application |

---

# Supported Android Versions

The application supports the following Android versions:

| API Level | Android Version | Supported |
|-----------|----------------|-----------|
| 24 | Android 7.0 (Nougat) | ✅ Yes |
| 25 | Android 7.1 | ✅ Yes |
| 26 | Android 8.0 (Oreo) | ✅ Yes |
| 27 | Android 8.1 (Oreo) | ✅ Yes |
| 28 | Android 9 (Pie) | ✅ Yes |
| 29 | Android 10 | ✅ Yes |
| 30 | Android 11 | ✅ Yes |
| 31 | Android 12 | ✅ Yes |
| 32 | Android 12L | ✅ Yes |
| 33 | Android 13 | ✅ Yes |
| 34 | Android 14 | ✅ Yes |
| 35 | Android 15 | ✅ Yes |
| 36 | Android 16 | ✅ Yes |

---

# Unsupported Android Versions

The following Android versions are **not supported**:

| API Level | Android Version |
|-----------|----------------|
| 20 and below | Android 4.4 and older |
| 21 | Android 5.0 |
| 22 | Android 5.1 |
| 23 | Android 6.0 |

Devices running Android 6.0 (API 23) or lower cannot install this application.

---

# Capacitor / Cordova Compatibility

The project uses:

| Component | Version |
|-----------|---------|
| Cordova Android | 14.0.1 |
| Capacitor Android | Project Dependency |
| AndroidX AppCompat | 1.7.1 |
| AndroidX Core | 1.17.0 |

The current configuration requires a modern Android environment and is optimized for Android 7.0 and above.

---

# Build Configuration Summary

```
Minimum Android Version : Android 7.0 (API 24)
Maximum Tested Target   : Android 16 (API 36)
Compile SDK             : Android 16 (API 36)
Target SDK              : Android 16 (API 36)
```

---

# Changing the Minimum Android Version

To support older Android devices, modify:

```gradle
minSdkVersion = 24
```

Example:

```gradle
minSdkVersion = 21
```

This will allow installation on Android 5.0 and above.

Before changing the minimum SDK version:

- Check Capacitor compatibility
- Check Cordova plugin requirements
- Verify AndroidX library support
- Test the application on older Android devices

---

# Final Compatibility Statement

✅ The application currently supports:

**Android 7.0 (API 24) through Android 16 (API 36)**

The recommended deployment range is:

**Android 8.0 (API 26) and above** for better performance, security, and compatibility.