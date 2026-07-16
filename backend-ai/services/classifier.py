"""Local machine-learning model lifecycle and inference."""

import pickle

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

from core.config import MODEL_PATH
from data.training import TRAINING_EXAMPLES


def build_or_load_model() -> Pipeline:
    """Load the persisted classifier, or train and persist it on first start."""
    if MODEL_PATH.exists():
        with MODEL_PATH.open("rb") as model_file:
            return pickle.load(model_file)

    texts, priorities = zip(*TRAINING_EXAMPLES)
    pipeline = Pipeline(
        [
            ("tfidf", TfidfVectorizer(stop_words="english")),
            ("classifier", MultinomialNB()),
        ]
    )
    pipeline.fit(texts, priorities)
    with MODEL_PATH.open("wb") as model_file:
        pickle.dump(pipeline, model_file)
    return pipeline


def classify_signal(model: Pipeline, text: str) -> tuple[int, float]:
    """Return the most likely priority and its confidence for a distress message."""
    probabilities = model.predict_proba([text])[0]
    priority = int(model.classes_[probabilities.argmax()])
    return priority, round(float(probabilities.max()), 4)
