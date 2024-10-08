#pragma once
#include<GLFW/glfw3.h>
#include<iostream>

class Window {

public :
	char* Title;
	static int Width, Height;

	Window(int width,int height);
	~Window();
	bool ShouldClose();
	void SwapBuffers();

private:
	std::unique_ptr<GLFWwindow> m_window;


};