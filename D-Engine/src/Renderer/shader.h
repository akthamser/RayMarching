#pragma once
#include <glad/glad.h> // include glad to get all the required OpenGL headers

#include"../Utils/Utils.h"
#include <glm/glm.hpp>


constexpr const char* SHADER_PATH = "Z:/DEV/RayMarching/D-Engine/src/Renderer/Shaders/";

class Shader
{
public:
    unsigned int ID;

    // Remove Default Constractor
    Shader() = delete;

    Shader(const char* vertexFile, const char* fragmentFile);
    ~Shader();

    void use();

    void setBool(const std::string& name, bool value) const;
    void setInt(const std::string& name, int value) const;
    void setFloat(const std::string& name, float value) const;
    void setVec2(const std::string& name, const glm::vec2& value) const;
    void setVec2(const std::string& name, float x, float y) const;
    void setVec3(const std::string& name, const glm::vec3& value) const;
    void setVec3(const std::string& name, float x, float y, float z) const;
    void setVec4(const std::string& name, const glm::vec4& value) const;
    void setVec4(const std::string& name, float x, float y, float z, float w) const;
    void setMat2(const std::string& name, const glm::mat2& mat) const;
    void setMat3(const std::string& name, const glm::mat3& mat) const;
    void setMat4(const std::string& name, const glm::mat4& mat) const;

};