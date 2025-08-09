import React, { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ToDoScreen() {
  const [userInput, setUserInput] = useState('');
  type Task = { id: string; title: string };
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
  }, [userInput]);

  const addTask = () => {
    const trimmed = userInput.trim();
    if (!trimmed) return;
    setTasks(prev => [...prev, { id: Date.now().toString(), title: trimmed }]);
    setUserInput('');
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  return (
    <View style={styles.container}>

      <View style={styles.inputRow}>
        <TextInput
          value={userInput}
          onChangeText={text => setUserInput(text)}
          style={styles.input}
        />
        <Button title="Add" onPress={addTask} />
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ marginTop: 16 }}
        renderItem={({ item }) => (
          <View style={styles.taskRow}>
            <Text style={styles.taskText}>{item.title}</Text>
            <TouchableOpacity onPress={() => removeTask(item.id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tasks yet. Add one above!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', 
    padding: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, 
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 8,
    marginRight: 8, 
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
  },
  deleteText: {
    color: 'red',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 24,
  },
});
