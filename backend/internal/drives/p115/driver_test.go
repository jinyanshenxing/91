package p115

import (
	"errors"
	"testing"
)

func TestIsTransient115ListError(t *testing.T) {
	cases := []struct {
		name string
		err  error
		want bool
	}{
		{name: "nil", err: nil, want: false},
		{name: "blocked html", err: errors.New(`<!doctype html><title>405</title>Sorry, your request has been blocked as it may cause potential threats to the server's security.`), want: true},
		{name: "chinese waf", err: errors.New("很抱歉，由于您访问的URL有可能对网站造成安全威胁，您的访问被阻断。"), want: true},
		{name: "rate limit", err: errors.New("429 too many requests"), want: true},
		{name: "regular auth error", err: errors.New("invalid credential"), want: false},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := isTransient115ListError(tc.err); got != tc.want {
				t.Fatalf("isTransient115ListError(%v) = %v, want %v", tc.err, got, tc.want)
			}
		})
	}
}
