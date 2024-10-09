#pragma once
#include<glad/glad.h>
#include<GLFW/glfw3.h>
#include<iostream>
#include"shader.h"
#include"Window.h"


class Renderer {

public:
	Renderer(Window& window);
	~Renderer();

	void Render();

private:
	Shader* m_shader;
	unsigned int VAO, VBO, EBO;
	Window& m_window;

	
};