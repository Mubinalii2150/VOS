import numpy as np, sys, pathlib
sys.path.insert(0,str(pathlib.Path(__file__).parents[1]))
from signal_processing.fft_analysis import fft_analysis
from signal_processing.feature_extraction import extract_features
def test_fft_and_features():
    fs=1000; t=np.arange(2000)/fs; x=np.exp(2j*np.pi*100*t)
    r=fft_analysis(x,fs); f=r["peak_frequencies_hz"]
    assert any(abs(v-100)<2 for v in f)
    assert extract_features(x,fs)["samples"]==2000
