1. Change gradle version in C:\Project\java\app_accounting\frontend\react\app\android\gradle\wrapper\gradle-wrapper.properties to
   distributionUrl=https\://services.gradle.org/distributions/gradle-8.14.3-bin.zip
2. Add local.properties file in /android and write sdk.dir=C:\\Users\\zs.c\\AppData\\Local\\Android\\Sdk
3. To temporary solve sdk problem:
   export ANDROID_HOME="$LOCALAPPDATA/Android/Sdk"
  export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
4. To check sdk
   echo $ANDROID_HOME
