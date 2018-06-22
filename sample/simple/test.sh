echo "Testing lib/add.py (should yield '7.0')"
echo "(echo 4 && echo 3) | python3 lib/add.py"
(echo 4 && echo 3) | python3 lib/add.py
echo ""

echo "Compile Minus.java (Minus.class should be created recently)"
echo "javac lib/Minus.java && ls -l lib"
javac lib/Minus.java && ls -l lib
echo ""

echo "Testing lib/Minus.class (should yield '1.0')"
echo "(echo 4 && echo 3) | java -cp lib Minus"
(echo 4 && echo 3) | java -cp lib Minus
echo ""

echo "Testing program.chiml (should yield '64')"
echo "chie program.chiml 10 6"
chie program.chiml 10 6
echo ""

echo "Compile program.chiml ('program.js' should be created recently)"
echo "chic program.chiml && ls -l"
chic program.chiml && ls -l
echo ""

echo "Testing program.js (should yield '36')"
echo "chie program.chiml 10 8"
chie program.chiml 10 8
echo ""

echo "rm -R node_modules program.js"
rm -R node_modules program.js

echo "All test Done"
