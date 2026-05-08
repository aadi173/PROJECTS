import './App.css'
import { useState } from 'react'

function App() {

  const quiz = [
    {
      question: "What is Encapsulation?",
      options: [
        "Wrapping data and methods together",
        "Creating many objects",
        "Using loops",
        "Deleting objects"
      ],
      answer: "Wrapping data and methods together"
    },

    {
      question: "What is Inheritance?",
      options: [
        "Hiding data",
        "Acquiring properties from another class",
        "Creating variables",
        "Using arrays"
      ],
      answer: "Acquiring properties from another class"
    },

    {
      question: "What is Polymorphism?",
      options: [
        "One interface with many forms",
        "Using only one class",
        "Deleting functions",
        "Creating loops"
      ],
      answer: "One interface with many forms"
    },

    {
      question: "What is Abstraction?",
      options: [
        "Showing only essential details",
        "Creating objects",
        "Using pointers",
        "Using recursion"
      ],
      answer: "Showing only essential details"
    }
  ]

  const [selectedAnswers, setSelectedAnswers] = useState({})

  const handleOptionClick = (questionIndex, option) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: option
    })
  }

  return (
    <div className="container">

      <h1>OOPS MCQ Quiz</h1>

      {quiz.map((q, index) => (
        <div key={index} className="card">

          <h3>{q.question}</h3>

          <div className="options">

            {q.options.map((option, i) => (

              <button
                key={i}
                className={
                  selectedAnswers[index] === option
                    ? "btn selected"
                    : "btn"
                }

                onClick={() =>
                  handleOptionClick(index, option)
                }
              >
                {option}
              </button>

            ))}

          </div>

          {selectedAnswers[index] && (

            <div className="result">

              {selectedAnswers[index] === q.answer ? (
                <p className="correct">
                  Right Answer
                </p>
              ) : (
                <p className="wrong">
                  Wrong Answer
                </p>
              )}

              <p className="answer">
                Correct Answer: {q.answer}
              </p>

            </div>

          )}

        </div>
      ))}

    </div>
  )
}

export default App